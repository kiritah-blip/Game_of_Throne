import Navbar     from '../components/Navbar'
import Characters from '../components/Characters'
import './PageLayout.css'

const PersonnagesPage = () => (
  <>
    <Navbar />
    <main className="page-main">
      <Characters />
    </main>
  </>
)

export default PersonnagesPage
