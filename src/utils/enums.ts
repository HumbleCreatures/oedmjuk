export enum FeedEventTypes { 
    ContentCreated = 'ContentCreated',
    CalendarEventCreated = 'CalendarEventCreated',
    ProposalEventCreated = 'ProposalEventCreated',
}

export enum ProposalStates { 
    ProposalCreated = 'ProposalCreated',
    ObjectionsResolved = 'ObjectionsResolved',
    VoteClosed = 'ProposalEventCreated',
    ProposalClosed = 'ProposalClosed',
}

export enum VoteValue {
    Accept = 'Accept',
    Reject = 'Reject',
    Abstain = 'Abstain',
}