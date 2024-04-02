import { Canvas } from "./_components/canvas"

interface BoardIdPageProps {
  params: {
    boardId: string
  }
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
  return (
    <>
      <Canvas />
    </>
  )
}

export default BoardIdPage
