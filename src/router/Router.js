import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Room, Home, NotFound } from '../pages'
import { ContextProvider } from '../context/Context'

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
