export interface EventTicket {
  ticketId: string;
  eventName: string;
  artist: string;
  venue: string;
  city: string;
  date: string; // ISO string
  seat?: string;
  verified: boolean;
  claimed: boolean;
}

export interface AfterShowNFT {
  mintAddress: string;
  ticketId: string;
  eventName: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  artworkSvg: string;
  claimedAt: string;
  ownerWallet: string;
}

export interface FanProfile {
  wallet: string;
  totalEvents: number;
  nfts: AfterShowNFT[];
}
