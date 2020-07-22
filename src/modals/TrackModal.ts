import { Track, DraftTrack, Artists } from '../interfaces/TrackInterface';

export class ArtistsModal {
    username: string;
    role: string;

    constructor(artist: Artists) {
        this.username = artist.username;
        this.role = artist.role;
    }

    public static fromArtists(artists: Artists[]): ArtistsModal[] {
        return artists.map(artist => new ArtistsModal(artist));
    }
}

export class TrackModal {
    id: string;
    owner: string;
    name: string;
    path: string;
    trackOrder: number;
    trackId: string;
    releaseId: string;
    active: boolean;
    versionType: string;
    explicit: boolean;
    ISRC: string;
    artist: ArtistsModal[];
    publisher: string;
    language: string;
    credit: string;
    isOwner: Boolean;
    isFirstRelease: Boolean;
    isBundle: Boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    isDeleted: boolean;
    bannedInfo: {
        reason: string,
        isWaiting: boolean,
        createdAt: Date,
    }
    constructor(track: Track) {
        this.id = track._id;
        this.owner = track.owner;
        this.name = track.name;
        this.path = track.path;
        this.trackOrder = track.trackOrder;
        this.trackId = track.trackId;
        this.releaseId = track.releaseId;
        this.active = track.active;
        this.versionType = track.versionType;
        this.explicit = track.explicit;
        this.ISRC = track.ISRC;
        this.artist = track.artist;
        this.publisher = track.publisher;
        this.language = track.language;
        this.credit = track.credit;
        this.isOwner = track.isOwner;
        this.isFirstRelease = track.isFirstRelease;
        this.isBundle = track.isBundle;
        this.createdAt = track.createdAt;
        this.createdBy = track.createdBy;
        this.updatedAt = track.updatedAt;
        this.updatedBy = track.updatedBy;
        this.isDeleted = track.isDeleted;
        this.bannedInfo = track.bannedInfo;
    }

    public static fromTracks(tracks: Track[]) {
        return tracks.map(track => new TrackModal(track));
    }

}

export class DraftTrackModal {
    id: string;
    owner: string;
    name: string;
    path: string;
    trackOrder: number;
    trackId: string;
    releaseId: string;
    versionType: string;
    explicit: boolean;
    ISRC: string;
    artist: ArtistsModal[];
    publisher: string;
    language: string;
    credit: string;
    isOwner: Boolean;
    isFirstRelease: Boolean;
    isBundle: Boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    constructor(track: DraftTrack) {
        this.id = track._id;
        this.owner = track.owner;
        this.name = track.name;
        this.path = track.path;
        this.trackOrder = track.trackOrder;
        this.trackId = track.trackId;
        this.releaseId = track.releaseId;
        this.versionType = track.versionType;
        this.explicit = track.explicit;
        this.ISRC = track.ISRC;
        this.artist = track.artist;
        this.publisher = track.publisher;
        this.language = track.language;
        this.credit = track.credit;
        this.isOwner = track.isOwner;
        this.isFirstRelease = track.isFirstRelease;
        this.isBundle = track.isBundle;
        this.createdAt = track.createdAt;
        this.createdBy = track.createdBy;
        this.updatedAt = track.updatedAt;
        this.updatedBy = track.updatedBy;
    }

    public static fromTracks(tracks: DraftTrack[]) {
        return tracks.map(track => new DraftTrackModal(track));
    }

}
