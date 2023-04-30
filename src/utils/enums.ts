export enum FeedEventTypes { 
    ContentCreated = 'ContentCreated',
    CalendarEventCreated = 'CalendarEventCreated',
    ProposalEventCreated = 'ProposalEventCreated',
    SelectionCreated = 'SelectionCreated',
}

export enum ProposalStates { 
    ProposalCreated = 'ProposalCreated',
    ObjectionsResolved = 'ObjectionsResolved',
    VoteClosed = 'ProposalEventCreated',
    ProposalClosed = 'ProposalClosed',
}

export enum SelectionStates { 
    Created = 'Created',
    BuyingStarted = 'BuyingStarted',
    VoteClosed = 'VoteClosed',
}

export enum VoteValue {
    Accept = 'Accept',
    Reject = 'Reject',
    Abstain = 'Abstain',
}