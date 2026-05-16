import './App.css'
import { AppLayout } from './app/layouts'
import { DashboardShell } from './modules/dashboard'

function App() {
  return (
    <AppLayout>
      <DashboardShell />
    </AppLayout>
  )
}

export default App
