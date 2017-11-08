import * as React from 'react'
import { MusicData, INewTrack, IMusicMeta } from '../../intefaces/music'
import './Player.scss'

interface IProps {
  musicData: MusicData;
}

interface IState {
  filterValue: string;
  playbackButtonState: string;
  activeTrack: INewTrack;
  localMusic: Array<any>;
  currentTime: number;
}

const PLAYBACK_STATUS = {
  play: 'play',
  stop: 'stop',
  waiting: 'waiting',
}

const SIDES = {
  prev: 'prev',
  next: 'next',
}

const DEFAULT_ACTIVE_TRACK = {
  artist: '',
  name: '',
  fullname: '',
  duration: 0,
}

/**
 * @desc Компонент кастомного плеера с плейлистом
 */
export class Player extends React.Component<IProps, IState> {
  audioNode: HTMLAudioElement;
  meta: IMusicMeta;

  constructor(props: IProps) {
    super(props)
    this.state = {
      filterValue: '', // Состояние поля фильтра
      playbackButtonState: PLAYBACK_STATUS.play, // Состояние кнопки ПУСК/ПАУЗА
      activeTrack: DEFAULT_ACTIVE_TRACK, // Данные об активной песне (исполнитель, название, длительность)
      localMusic: [], // При получении музыки извне, компонент добавляет разнные данные к песням и хранит у себя в состоянии
      currentTime: 0, // Время песни (каком месте остановился плеер)
    }
  }

  render() {
    const {
      props,
      state,
      renderMusicList,
      filterMusic,
      handleChangeFilterInput,
    } = this
    const {
      filterValue,
      playbackButtonState,
      localMusic,
      activeTrack,
      currentTime,
    } = state

    return (
      <div className='player'>
        <audio
          ref={this.saveAudioRefAndAddListeners}
          src={this.createFullPathToSong(activeTrack.fullname)}
        />
        <div className='player__controls'>
          <div
            className='player__prev'
            onClick={this.handleClickPrev}
          >
            {'<'}
          </div>
          <div
            className={`player__playback-button player__playback-button--${playbackButtonState}`}
            onClick={this.handleClickPlaybackButton}
          >
              {playbackButtonState}
          </div>
          <div
            className='player__next'
            onClick={this.handleClickNext}
          >
            {'>'}
          </div>
          <div className='player__progress-bar-wrapper'>
            <div
              className='player__progress-bar'
              onClick={this.handleClickProgressBar}
            >
              <div
                className='player__progress-bar--progress'
                style={this.getProgressStyle(currentTime, activeTrack.duration)}
              ></div>
            </div>
          </div>
          <div className='player__time'>
            <div className='player__current-time'>{this.formatSongTime(currentTime)}</div>
            <div className='player__time-separator'>/</div>
            <div className='player__total-time'>{this.formatSongTime(activeTrack.duration)}</div>
          </div>
          <div className='player__volume'>
            <input
              className='player__volume-range'
              type='range'
              min='0.01'
              max='1'
              step='0.01'
              defaultValue='0.5'
              onChange={this.handleChangeVolume}
            />
          </div>
        </div>
        <input
          className='player__filter-input'
          placeholder='Search for artists or tracks'
          type="text"
          value={filterValue}
          onChange={handleChangeFilterInput}
        />
        { renderMusicList(filterMusic(filterValue, localMusic)) }
      </div>
    )
  }

  // LIFE CYCLE METHODS

  componentWillReceiveProps(newProps: any): void {

    // Сохраняем различные метаданные, добавляем к полученным песням данные о их длительности
    this.meta = newProps.musicData.meta
    this.addDurationToLocalMusic(newProps.musicData.music)
    
  }

  componentDidUpdate() {

    // Добавляем первый в списке трек в состояние воспоизведения
    this.setDefaultTrackToState()
  }


  // HANDLE METHODS

  handleChangeVolume = (e: any): void => {
    this.audioNode.volume = e.target.value
  }

  handleClickProgressBar = ({nativeEvent, target}: any): void => {
    const { activeTrack: {duration}, playbackButtonState } = this.state

    // Вычисляем, на каком расстоянии нажал пользователь и меняем время песни
    this.audioNode.currentTime = nativeEvent.offsetX / target.parentElement.clientWidth * duration

    // Если плеер на паузе, то перевести в состояние воспроизведения
    if (playbackButtonState === PLAYBACK_STATUS.play) this.play()
  }

  handleClickPrev = (): void => {
    this.putTrackBySide(SIDES.prev)
  }

  handleClickNext = (): void => {
    this.putTrackBySide(SIDES.next)
  }

  handleEndedAudio = (): void => {
    this.putTrackBySide(SIDES.next)
  }

  handleChangeFilterInput = (e: any): void => {
    this.setState({
      filterValue: e.target.value,
    })
  }

  handleClickPlaybackButton = (): void => {
    this.togglePlaybackButton()
  }

  handleClickOnTrack = (track: INewTrack) => (): void => {
    const {activeTrack} = this.state
    if (activeTrack.fullname === track.fullname) {
      this.togglePlaybackButton()
      return;
    }
    this.setDefaultButtonState()
    this.playTrack(track)
  }

  handleTimeUpdate = (): boolean => {
    const { currentTime } = this.state
    const audioTime: number = Math.floor(this.audioNode.currentTime)
    if (currentTime === audioTime) return false;
    this.setState({
      currentTime: audioTime,
    })
  }


  // RENDER METHODS

  //TODO: Перевести обработчик клика на список

  /**
   * @desc Создает jsx-элемент песни в плейлисте
   * @param {INewTrack} songData Данные о песне
   * @return {JSX.Element}
   */
  renderTrackItem = (songData: INewTrack): JSX.Element => {
    const { activeTrack } = this.state
    const itemClass: string = `player__item ${activeTrack.fullname === songData.fullname ? 'player__item--active': ''}`
    return (
      <li
        className={itemClass}
        key={songData.fullname}
        onClick={this.handleClickOnTrack(songData)}
      >
        <div className='player__item-song'>
          { this.getSongName(songData) }
        </div>
        <div className='player__item-duration'>
          { this.formatSongTime(songData.duration) }
        </div>
        
      </li>
    )
  }

  renderMusicList = (music: Array<INewTrack> = []): JSX.Element => {
    const { filterValue } = this.state
    const classList: string = `player__list ${music.length === 0 && filterValue === '' ? 'player__list--loader' : ''}`  
    return (
      <ul className={classList}>
        {
          music.map((track: any) => this.renderTrackItem(track))
        }
      </ul>
    )
  }



  // CUSTOM METHODS

  /**
   * @desc Вычесляем ширину полосы воспроизведения песни
   * @param {number} currentTime Текущее время песни в секундах 
   * @param {duration} currentTime Общее время песни в секундах
   * @return {Object}
   */
  getProgressStyle = (currentTime: number, duration: number) => {
    return {
      width: currentTime / duration * 100 + '%',
    }
  }

  //TODO: Сделать более декларативным

  /**
   * @desc В зависимости от выбранной стороны, воспроизвести песню слева или справа
   * @param {string} side С какой стороны воспроизвести песню
   */
  putTrackBySide = (side: string) => {
    const { activeTrack, localMusic } = this.state
  
    // Узнаем под каким индеком в массиве всех песен находится активная
    const indexActiveSong: number = localMusic.findIndex(songData => songData.fullname === activeTrack.fullname)

    if (indexActiveSong < 0 || localMusic.length === 0) {
      console.error('Не найдена песня или их негде искать')
      return false
    }

    let newSong: INewTrack;
    switch(side) {
      case SIDES.next:
        newSong = localMusic[indexActiveSong + 1] || localMusic[0]
        break
      case SIDES.prev:
        newSong = localMusic[indexActiveSong - 1] || localMusic[localMusic.length - 1]
        break
    }
    this.setState({
      activeTrack: newSong,
    }, this.play)
  }

  /**
   * @desc Сохраняет ссылку на dom-узел тега <audio/> и подписывается на события
   */
  saveAudioRefAndAddListeners = (ref: any) => {
    this.audioNode = ref;
    this.addListeners()
  }

  addListeners = () => {
    if (!this.audioNode) return

    // Когда песня закончилась
    this.audioNode.onended = this.handleEndedAudio

    // Кодга время песни изменилось
    this.audioNode.ontimeupdate = this.handleTimeUpdate
  }

  /**
   * @desc В зависимости от состояния, делать кнопку воспроизведения либо "ПАУЗА", либо "ПУСК".
   * В соответствии с этим запускать песню или ставить на паузу
   */
  togglePlaybackButton = () => {
    switch(this.state.playbackButtonState) {
      case PLAYBACK_STATUS.play:
        this.play()
        break;
      case PLAYBACK_STATUS.stop:
        this.pause()
        break;
    }
  }

  setDefaultButtonState = () => {
    this.setState({
      playbackButtonState: PLAYBACK_STATUS.play,
    })
  }

  playTrack = (track: INewTrack) => {
    this.setState({
      activeTrack: track,
    }, this.togglePlaybackButton)
  }

  play = () => {
    const { activeTrack } = this.state
    if (activeTrack !== DEFAULT_ACTIVE_TRACK) {
      this.audioNode.play()
      this.setState({
        playbackButtonState: PLAYBACK_STATUS.stop,
      })
    }
  }

  pause = () => {
    this.audioNode.pause()
    this.setState({
      playbackButtonState: PLAYBACK_STATUS.play,
    })
  }

  /**
   * @desc Получить название песни для плейлиста из общих данных о ней
   */
  getSongName = ({ artist, name, fullname}: INewTrack): string  => {
    return (artist && name)
    ? this.getBeautySongString(artist, name)
    : this.getSongWithoutFormat(fullname)
  }

  /**
   * @desc Получить из полного названия песни все, кроме формата.
   * Например: Alfi_Goggy-start.mp3 -> Alfi_Goggy-start
   */
  getSongWithoutFormat = (songName: string): string => {
    return songName.slice(0, songName.indexOf('.'))
  }

  /**
   * @desc Делает из исполнителя и названия более красивую строку. Например: Prodigy - God
   */
  getBeautySongString = (artist: string, name: string): string  => {
    return artist + ' - ' + name
  }

  filterMusic = (filterValue: string = '', music: Array<INewTrack> = []): Array<any> => {
    return music.filter(
      (songData: INewTrack) => this
        .getSongName(songData)
        .toLowerCase()
        .includes(filterValue.toLowerCase().trim())
    )
  }

  setDefaultTrackToState = () => {
    const song: INewTrack = this.getFisrtTrack()
    if (this.state.activeTrack === DEFAULT_ACTIVE_TRACK && song) {
      this.setState({
        activeTrack: song,
      })
    }
  }

  getFisrtTrack = (): INewTrack => {
    const { localMusic } = this.state

    if (localMusic.length === 0) return null

    return localMusic[0]
  }

  /**
   * @desc Составляет путь к файлу, чтобы браузер мог его получить в виде статики
   */
  createFullPathToSong = (songName: string = ''): string => {
    if (!songName || typeof this.meta.path !== 'string') return ''

    return this.meta.path + songName
  }

  /**
   * @desc Добавить к песням в плейлисте их длительность
   */
  addDurationToLocalMusic = (newMusic: Array<INewTrack>): void => {
    Promise
      .all(
        newMusic.map(
          async song => Object.assign({}, song,
            {
              duration: await this.getSongDuration(song.fullname),
            }
          )
        )
      )
      .then(musicWithDuration => {
        this.setState({
          localMusic: musicWithDuration,
        })
      })
  }

  /**
   * @desc Получаем длительность песни на основе его метаданных
   */
  getSongDuration(songName: string = ''): Promise<number> {
    const path: string = this.createFullPathToSong(songName)

    if (path === '') return Promise.resolve(0)

    return new Promise((resolve, reject) => {
      const audio = new Audio(path)
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
    })
  }

  /**
   * @desc Форматирает время в секундах в более человеческий вид. Например: 123 -> 02:03
   */
  formatSongTime = (time: number): string => {
    const separator: string = ':'
    const minutes: number = Math.floor(time / 60)
    const seconds: number = Math.floor(time % 60)
    return `${minutes < 10 ? '0' + minutes : minutes}` + separator + `${seconds < 10 ? '0' + seconds : seconds}`
  }
}