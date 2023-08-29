import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Room, NotFound, Rooms } from '../pages'

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Rooms />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
