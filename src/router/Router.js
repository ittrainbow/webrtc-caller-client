import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ContextProvider } from '../context/Context'
import { Room, Home, NotFound } from '../pages'

export const Router = () => {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ContextProvider>
    </BrowserRouter>
  )
}
