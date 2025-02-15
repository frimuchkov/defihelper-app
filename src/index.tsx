import ReactDOM from 'react-dom'
import 'normalize.css'
import cachios from 'cachios'

import './index.css'
import { App } from './app'

window.axios = cachios

ReactDOM.render(<App />, document.getElementById('root'))
