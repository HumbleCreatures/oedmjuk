export enum SpaceFeedEventTypes { 
    ContentCreated = 'ContentCreated',
    CalendarEventCreated = 'CalendarEventCreated',
    ProposalEventCreated = 'ProposalEventCreated',
    SelectionCreated = 'SelectionCreated',
    FeedbackRoundCreated = 'FeedbackRoundCreated',
    DataIndexCreated = 'DataIndexCreated',
    ContentUpdated = 'ContentUpdated',
    CalendarEventUpdated = 'CalendarEventUpdated',
    ProposalEventUpdated = 'ProposalEventUpdated',
    SelectionUpdated = 'SelectionUpdated',
    FeedbackRoundUpdated = 'FeedbackRoundUpdated',
    DataIndexUpdated = 'DataIndexUpdated',
}

export enum UserFeedEventTypes { 
    ProposalEventCreated = 'ProposalEventCreated',
    ProposalObjectionAdded = 'ProposalObjectionAdded',
    ProposalVotingStarted = 'ProposalVotingStarted',
    ProposalVotingEnded = 'ProposalVotingEnded',
    SelectionCreated = 'SelectionCreated',
    SelectionAlternativeAdded = 'SelectionAlternativeAdded',
    SelectionVoteStarted = 'SelectionVoteStarted',
    SelectionVoteEnded = 'SelectionVoteEnded',
    CalendarEventCreated = 'CalendarEventCreated',
    CalendarEventUpdate = 'CalendarEventUpdated',
    ContentCreated = 'ContentCreated',
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

export enum FeedbackRoundStates { 
    Created = 'Created',
    Closed = 'Closed',
}

export enum VoteValue {
    Accept = 'Accept',
    Reject = 'Reject',
    Abstain = 'Abstain',
}