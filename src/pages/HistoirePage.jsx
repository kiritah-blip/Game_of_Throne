import Navbar  from '../components/Navbar'
import History from '../components/History'
import './PageLayout.css'

const HistoirePage = () => (
  <>
    <Navbar />
    <main className="page-main">
      <History />
    </main>
  </>
)

export default HistoirePage
