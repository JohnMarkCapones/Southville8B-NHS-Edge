namespace SouthvilleEPortal.API.Shared.Domain;

public abstract record DomainEvent(Guid EventId, DateTime OccurredOn);
