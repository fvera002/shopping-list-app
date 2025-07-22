"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Check, History, ShoppingCart } from "lucide-react"

interface ShoppingItem {
  id: string
  text: string
  completed: boolean
}

interface CompletedList {
  id: string
  name: string
  items: ShoppingItem[]
  completedAt: string
  totalItems: number
  completedItems: number
}

export default function ShoppingListApp() {
  const [currentList, setCurrentList] = useState<ShoppingItem[]>([])
  const [completedLists, setCompletedLists] = useState<CompletedList[]>([])
  const [newItem, setNewItem] = useState("")
  const [listName, setListName] = useState("")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCurrentList = localStorage.getItem("currentShoppingList")
    const savedCompletedLists = localStorage.getItem("completedShoppingLists")

    if (savedCurrentList) {
      setCurrentList(JSON.parse(savedCurrentList))
    }

    if (savedCompletedLists) {
      setCompletedLists(JSON.parse(savedCompletedLists))
    }
  }, [])

  // Save current list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentShoppingList", JSON.stringify(currentList))
  }, [currentList])

  // Save completed lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("completedShoppingLists", JSON.stringify(completedLists))
  }, [completedLists])

  const addItem = () => {
    if (newItem.trim() !== "") {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false,
      }
      setCurrentList([...currentList, item])
      setNewItem("")
    }
  }

  const removeItem = (id: string) => {
    setCurrentList(currentList.filter((item) => item.id !== id))
  }

  const toggleItemCompletion = (id: string) => {
    setCurrentList(currentList.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const completeList = () => {
    if (currentList.length === 0) return

    const completedList: CompletedList = {
      id: Date.now().toString(),
      name: listName.trim() || `Shopping List ${new Date().toLocaleDateString()}`,
      items: [...currentList],
      completedAt: new Date().toISOString(),
      totalItems: currentList.length,
      completedItems: currentList.filter((item) => item.completed).length,
    }

    setCompletedLists([completedList, ...completedLists])
    setCurrentList([])
    setListName("")
  }

  const deleteCompletedList = (id: string) => {
    setCompletedLists(completedLists.filter((list) => list.id !== id))
  }

  const completedItemsCount = currentList.filter((item) => item.completed).length
  const totalItemsCount = currentList.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping List</h1>
          <p className="text-gray-600">Organize your shopping and keep track of your history</p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Current List
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History ({completedLists.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Shopping List</span>
                  {totalItemsCount > 0 && (
                    <Badge variant="secondary">
                      {completedItemsCount}/{totalItemsCount} completed
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Add items to your shopping list and mark them as completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* List Name Input */}
                <div className="space-y-2">
                  <label htmlFor="listName" className="text-sm font-medium">
                    List Name (optional)
                  </label>
                  <Input
                    id="listName"
                    placeholder="e.g., Weekly Groceries, Party Supplies..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                  />
                </div>

                {/* Add Item Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addItem()
                      }
                    }}
                  />
                  <Button onClick={addItem}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Shopping List Items */}
                <div className="space-y-2">
                  {currentList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your shopping list is empty</p>
                      <p className="text-sm">Add some items to get started!</p>
                    </div>
                  ) : (
                    currentList.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow ${
                          item.completed ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.completed}
                            onCheckedChange={() => toggleItemCompletion(item.id)}
                          />
                          <label
                            htmlFor={`item-${item.id}`}
                            className={`font-medium cursor-pointer ${
                              item.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {item.text}
                          </label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Complete List Button */}
                {currentList.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button onClick={completeList} className="w-full" size="lg">
                      <Check className="w-4 h-4 mr-2" />
                      Complete Shopping List
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Shopping History</CardTitle>
                <CardDescription>View your completed shopping lists</CardDescription>
              </CardHeader>
              <CardContent>
                {completedLists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No completed lists yet</p>
                    <p className="text-sm">Complete your first shopping list to see it here!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedLists.map((list) => (
                      <Card key={list.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{list.name}</CardTitle>
                              <CardDescription>
                                Completed on {new Date(list.completedAt).toLocaleDateString()} at{" "}
                                {new Date(list.completedAt).toLocaleTimeString()}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {list.completedItems}/{list.totalItems} completed
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCompletedList(list.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {list.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-2 text-sm">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    item.completed ? "bg-green-500 border-green-500" : "border-gray-300"
                                  }`}
                                >
                                  {item.completed && <Check className="w-2 h-2 text-white" />}
                                </div>
                                <span className={item.completed ? "line-through text-gray-500" : ""}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
