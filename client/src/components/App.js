import React from 'react'
import Header from './Header'
import UserCreate from './UserCreate'
import ChatHub from './ChatHub'

/**
 * App just handles passing to UserCreate, and passing to ChatHub
 * UserCreate handles registering User or logging in with existing token
 * ChatHub handles finding room, sharing audio/video, socket connectivity, settings
 * TextChat handles rendering chat and socket transmissions
 * VideoWindow handles rendering streams (local and remote)
 */

class App extends React.Component {
  state = {
    user: null,
  }

  // Called from UserCreate.js after user has been created
  storeUser = user => {
    console.log(user)
    this.setState({ user })
  }

  renderContents = () => {
    const { user } = this.state
    if (user) {
      return <ChatHub user={user} />
    }
    return (
      <div>
        <Header />
        <UserCreate storeUser={this.storeUser} />
      </div>
    )
  }

  render() {
    return <div>{this.renderContents()}</div>
  }
}

export default App
