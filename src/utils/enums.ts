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
    CalendarEventAttending = 'CalendarEventAttending',
    CalendarEventNotAttending = 'CalendarEventNotAttending',
    
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
    Started = 'Started',
    Closed = 'Closed',
}

export enum RequestAccessStates { 
    Created = 'Created',
    Approved = 'Approved',
    Denied = 'Denied',
    Executed = 'Executed',
}

export enum VoteValue {
    Accept = 'Accept',
    Reject = 'Reject',
    Abstain = 'Abstain',
}

export enum EventChannels {
    FeedbackRound = 'FeedbackRound'
}

export enum ChannelEventTypes {
    FeedbackItemMoved = 'FeedbackItemMoved'
}