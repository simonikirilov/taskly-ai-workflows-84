import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if dark mode is already set
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
    
    // Set dark mode by default for Taskly
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    setIsDark(!isDark)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="h-9 w-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  )
}