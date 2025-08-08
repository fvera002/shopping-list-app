"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

import { db } from "../lib/firebase" // Corrected import path
import { doc, onSnapshot, setDoc } from "firebase/firestore"

// Define a type for your shopping list items
type ShoppingItem = {
  text: string;
  completed: boolean;
}

const SHOPPING_LIST_DOC_ID = "currentShoppingList"

export default function Home() {
  // Correctly type the useState hook
  const [list, setList] = useState<ShoppingItem[]>([])
  const [item, setItem] = useState("")

  useEffect(() => {
    const listDocRef = doc(db, "shopping-lists", SHOPPING_LIST_DOC_ID)

    const unsubscribe = onSnapshot(listDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setList(data.items as ShoppingItem[] || [])
      } else {
        console.log("No shopping list document found. A new one will be created on save.")
        setList([])
      }
    }, (error) => {
      console.error("Error fetching real-time data: ", error)
    })

    return () => unsubscribe()
  }, [])

  const saveList = async () => {
    const listDocRef = doc(db, "shopping-lists", SHOPPING_LIST_DOC_ID)
    try {
      await setDoc(listDocRef, { items: list })
      console.log("Shopping list saved to Firestore!")
    } catch (e) {
      console.error("Error saving shopping list: ", e)
    }
  }

  const addToList = () => {
    if (item.trim() !== "") {
      const newList = [...list, { text: item, completed: false }]
      setList(newList)
      setItem("")
    }
  }

  const toggleComplete = (index: number) => { // Added type for index
    const newList = [...list]
    newList[index].completed = !newList[index].completed
    setList(newList)
  }

  const deleteItem = (index: number) => { // Added type for index
    const newList = list.filter((_, i) => i !== index)
    setList(newList)
  }

  useEffect(() => {
    if (list.length > 0 || item !== "") {
      saveList()
    }
  }, [list])

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>
            This list is shared by everyone using the app!
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button onClick={addToList}>Add</Button>
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
                  &times;
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Click an item to toggle its completion.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}