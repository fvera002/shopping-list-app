"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, ShoppingCart, History } from "lucide-react"

import { db } from "../lib/firebase"
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore"

// Define a type for your shopping list items
type ShoppingItem = {
  text: string;
  completed: boolean;
}

// Define a type for a historical list
type HistoryItem = {
  id: string;
  items: ShoppingItem[];
  savedAt: Date;
}

const APP_DATA_DOC_ID = "appData"

export default function Home() {
  const [list, setList] = useState<ShoppingItem[]>([])
  const [item, setItem] = useState("")
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    const appDocRef = doc(db, "app-data", APP_DATA_DOC_ID)

    const unsubscribe = onSnapshot(appDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()

        setList((data.currentList as ShoppingItem[]) || [])

        const fetchedHistory = (data.history as any[] || []).map((hItem) => ({
          ...hItem,
          savedAt: hItem.savedAt instanceof Timestamp ? hItem.savedAt.toDate() : hItem.savedAt
        }))
        setHistory(fetchedHistory)

      } else {
        console.log("No app data document found. Creating a new one.")
        setList([])
        setHistory([])
      }
    }, (error) => {
      console.error("Error fetching real-time data: ", error)
    })

    return () => unsubscribe()
  }, [])

  const saveList = async (currentList: ShoppingItem[], history: HistoryItem[]) => {
    const appDocRef = doc(db, "app-data", APP_DATA_DOC_ID)
    try {
      await setDoc(appDocRef, { currentList, history }, { merge: false })
      console.log("App data successfully saved to Firestore!")
    } catch (e) {
      console.error("Error saving app data: ", e)
    }
  }

  const addToList = () => {
    if (item.trim() !== "") {
      const newList = [...list, { text: item, completed: false }]
      setList(newList)
      setItem("")
      saveList(newList, history)
    }
  }

  const toggleComplete = (index: number) => {
    const newList = [...list]
    newList[index].completed = !newList[index].completed
    setList(newList)
    saveList(newList, history)
  }

  const deleteItem = (index: number) => {
    const newList = list.filter((_, i) => i !== index)
    setList(newList)
    saveList(newList, history)
  }

  const saveListToHistory = () => {
    if (list.length > 0) {
      const allCompleted = list.every(item => item.completed);
      if(allCompleted) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          items: list,
          savedAt: new Date()
        };
        const newHistory = [...history, newHistoryItem];
        setHistory(newHistory);
        setList([]);
        saveList([], newHistory);
        setActiveTab("history");
      }
    }
  }

  useEffect(() => {
    if (list.length > 0 && list.every(item => item.completed)) {
      saveListToHistory();
    }
  }, [list])

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>
            Add items to your shopping list and mark them as completed
          </CardDescription>
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={() => setActiveTab("list")}
              variant={activeTab === "list" ? "default" : "outline"}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Current List
            </Button>
            <Button
              onClick={() => setActiveTab("history")}
              variant={activeTab === "history" ? "default" : "outline"}
            >
              <History className="mr-2 h-4 w-4" /> History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "list" ? (
            <>
              <div className="flex space-x-2 mb-4">
                <Input
                  type="text"
                  placeholder="Add an item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addToList()
                  }}
                />
                <Button onClick={addToList}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {list.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleComplete(index)}
                      id={`item-${index}`}
                    />
                    <label
                      htmlFor={`item-${index}`}
                      className={`flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.completed ? "line-through text-gray-500" : ""}`}
                    >
                      {item.text}
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((hItem) => (
                  <Card key={hItem.id} className="p-4 bg-gray-50">
                    <p className="text-sm font-semibold mb-2">Saved on: {hItem.savedAt.toLocaleDateString()}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {hItem.items.map((item, index) => (
                        <li key={index} className={item.completed ? "line-through text-gray-500" : ""}>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center">Complete your first shopping list to see it here!</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}