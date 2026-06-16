import Navbar  from '../components/Navbar'
import Dragons from '../components/Dragons'
import './PageLayout.css'

const DragonsPage = () => (
  <>
    <Navbar />
    <main className="page-main">
      <Dragons />
    </main>
  </>
)

export default DragonsPage
