export enum FeedEventTypes { 
    ContentCreated = 'ContentCreated',
    CalendarEventCreated = 'CalendarEventCreated',
    ProposalEventCreated = 'ProposalEventCreated',
    SelectionCreated = 'SelectionCreated',
    FeedbackRoundCreated = 'FeedbackRoundCreated',
    DataIndexCreated = 'DataIndexCreated',
}

export enum ProposalStates { 
    ProposalCreated = 'ProposalCreated',
    ObjectionsResolved = 'ObjectionsResolved',
    VoteClosed = 'VoteClosed',
    ProposalClosed = 'ProposalClosed',
}

export enum SelectionStates { 
    Created = 'Created',
    BuyingStarted = 'BuyingStarted',
    VoteClosed = 'VoteClosed',
}

export enum FeedbackItemStates { 
    Created = 'Created',
    Closed = 'Closed',
}

export enum VoteValue {
    Accept = 'Accept',
    Reject = 'Reject',
    Abstain = 'Abstain',
}