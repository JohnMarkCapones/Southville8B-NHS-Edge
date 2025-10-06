using SouthvilleEPortal.API.Shared.Domain;

namespace SouthvilleEPortal.API.Modules.Students.Domain.Events;

public record StudentRegistered(Guid EventId, DateTime OccurredOn, Guid StudentId) : DomainEvent(EventId, OccurredOn);
