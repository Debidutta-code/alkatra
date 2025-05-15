import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/flight-ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Extras() {
  const [selectedPreference, setSelectedPreference] = React.useState("")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meal choice</CardTitle>
        <p className="text-sm text-muted-foreground">Request dietary preferences</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Binaya Das
          </label>
          <Select onValueChange={setSelectedPreference}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="no-preference">No preference</SelectItem>
              <SelectItem value="vegetarian">Vegetarian - Free</SelectItem>
              <SelectItem value="vegan">Vegan - Free</SelectItem>
              <SelectItem value="lactose-free">Lactose free - Free</SelectItem>
              <SelectItem value="gluten-free">Gluten free - Free</SelectItem>
              <SelectItem value="kosher">Kosher - Free</SelectItem>
              <SelectItem value="halal">Halal - Free</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}