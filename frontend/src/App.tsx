import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { Departments } from "./pages/Departments";
import { Login } from "./pages/Login";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="hrm-ui-theme">
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Login Route */}
              <Route path="/login" element={<Login />} />
              
              {/* Main App Routes */}
              <Route
                path="/*"
                element={
                  <div className="flex h-screen">
                    {/* Sidebar */}
                    <Sidebar />
                    
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 overflow-auto p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/employees" element={<Employees />} />
                          <Route path="/departments" element={<Departments />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                }
              />
            </Routes>
            
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
