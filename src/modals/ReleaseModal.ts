import { Artists, Release, DraftRelease } from '../interfaces/ReleaseInterface';

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

    public static fromArtistsString(artists: any[]): ArtistsModal[] {
        return artists.map(artist => new ArtistsModal(artist));
    }
}

export class ReleaseModal {
    id: string;
    owner: string;
    title: string;
    releaseId: string;
    active: boolean;
    cover: string;
    artist: ArtistsModal[];
    labelId: string;
    genre: string;
    barcode: string;
    credit: string;
    countries: string;
    shops: string;
    description: string;
    catalogNo: string;
    status: string;
    releaseAt: Date;
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
    constructor(release: Release) {
        this.id = release._id;
        this.owner = release.owner;
        this.title = release.title;
        this.releaseId = release.releaseId;
        this.active = release.active;
        this.artist = release.artist;
        this.cover = release.cover;
        this.labelId = release.labelId;
        this.genre = release.genre;
        this.barcode = release.barcode;
        this.credit = release.credit;
        this.countries = release.countries;
        this.shops = release.shops;
        this.description = release.description;
        this.catalogNo = release.catalogNo;
        this.status = release.status;
        this.releaseAt = release.releaseAt;
        this.createdAt = release.createdAt;
        this.createdBy = release.createdBy;
        this.updatedAt = release.updatedAt;
        this.updatedBy = release.updatedBy;
        this.isDeleted = release.isDeleted;
        this.bannedInfo = release.bannedInfo;
    }

    public static fromReleases(releases: Release[]) {
        return releases.map(release => new ReleaseModal(release));
    }

}


export class DraftReleaseModal {
    id: string;
    owner: string;
    title: string;
    releaseId: string;
    cover: string;
    artist: ArtistsModal[];
    labelId: string;
    genre: string;
    barcode: string;
    credit: string;
    countries: string;
    shops: string;
    description: string;
    catalogNo: string;
    releaseAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    constructor(release: DraftRelease) {
        this.id = release._id;
        this.owner = release.owner;
        this.title = release.title;
        this.releaseId = release.releaseId;
        this.cover = release.cover;
        this.artist = release.artist;
        this.labelId = release.labelId;
        this.genre = release.genre;
        this.barcode = release.barcode;
        this.credit = release.credit;
        this.countries = release.countries;
        this.shops = release.shops;
        this.description = release.description;
        this.catalogNo = release.catalogNo;
        this.releaseAt = release.releaseAt;
        this.createdAt = release.createdAt;
        this.createdBy = release.createdBy;
        this.updatedAt = release.updatedAt;
        this.updatedBy = release.updatedBy;
    }

    public static fromReleases(releases: DraftRelease[]) {
        return releases.map(release => new DraftReleaseModal(release));
    }

}