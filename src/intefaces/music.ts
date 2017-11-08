export interface Track {
  artist: string;
  name: string;
  fullname: string;
}

export interface MusicData {
  meta: {
    path: string;
  };
  music: Array<Track>;
}

export interface INewTrack {
  artist: string;
  name: string;
  fullname: string;
  duration: number;
}

export interface IMusicMeta {
  path: string;
}