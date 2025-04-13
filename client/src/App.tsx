import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import { BookmarkProvider } from "@/hooks/useBookmarks";
import { FolderProvider } from "@/hooks/useFolders";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FolderProvider>
        <BookmarkProvider>
          <Router />
          <Toaster />
        </BookmarkProvider>
      </FolderProvider>
    </QueryClientProvider>
  );
}

export default App;
