export enum FeedEventTypes { 
    ContentCreated = 'ContentCreated',
    FeedbackRoundCreated = 'FeedbackRoundCreated',
    DataIndexCreated = 'DataIndexCreated',
    ContentUpdated = 'ContentUpdated',
    CalendarEventUpdated = 'CalendarEventUpdated',
    ProposalEventUpdated = 'ProposalEventUpdated',
    SelectionUpdated = 'SelectionUpdated',
    FeedbackRoundUpdated = 'FeedbackRoundUpdated',
    FeedbackRoundStarted = 'FeedbackRoundStarted',
    DataIndexUpdated = 'DataIndexUpdated',
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
    AccessRequestOnBehalfOfUser = 'AccessRequestOnBehalfOfUser',
    AccessRequestOnBehalfOfSpace = 'AccessRequestOnBehalfOfSpace',
    AccessRequestCreator = 'AccessRequestCreator',
    AccessRequestCreated = 'AccessRequestCreated',
}

export enum ProposalStates { 
    ProposalCreated = 'ProposalCreated',
    ProposalOpen = 'ProposalOpen',
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

export enum AccessRequestStates { 
    Created = 'Created',
    Approved = 'Approved',
    Denied = 'Denied',
    Finished = 'Finished',
}

export enum AccessRequestStepTypes { 
    Manual = 'Manual',
    JoinSpace = 'JoinSpace',
    OnBehalfOfUserApproval = 'OnBehalfOfUser',
    OnBehalfOfSpaceApproval = 'OnBehalfOfSpace',
    RequesterApproval = 'RequesterApproval',
    CalendarEvent = 'CalendarEvent',
    AccessRequest = 'AccessRequest',
    Feedback = 'Feedback',
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