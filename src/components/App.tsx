import * as React from 'react'
import { Player } from '../components'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { NEW_MUSIC, GET_MUSIC, SEND_MUSIC } from '../../server/constants/music'
import { saveMusic } from '../actions'
import { MusicData } from '../intefaces/music'

interface IProps {
  socket: SocketIOClient.Socket;
  musicData: MusicData;
  saveMusic: Function;
}

export class AppComponent extends React.PureComponent<IProps, any> {

  render() {
    const { musicData } = this.props
    return (
      <div>
        <Player
          musicData={musicData}
        />
      </div>
    )
  }

  componentDidMount() {
    const { socket } = this.props
    socket.on(NEW_MUSIC, this.handleServerHasNewMusic)
    socket.on(SEND_MUSIC, this.handleServerSendMusic)
  }

  handleServerHasNewMusic = () => {
    const { socket } = this.props
    socket.emit(GET_MUSIC)
  }

  handleServerSendMusic = (newMusic: any) => {
    const { saveMusic } = this.props
    saveMusic(newMusic)
  }
}


function mapStateToProps(state: any) {
  return {
    socket: state.socket,
    musicData: state.music,
  }
}

function mapDispatcheToProps(dispatch: any) {
  return {
    saveMusic: bindActionCreators<any>(saveMusic, dispatch),
  }
}

export const App = connect(mapStateToProps, mapDispatcheToProps)(AppComponent)