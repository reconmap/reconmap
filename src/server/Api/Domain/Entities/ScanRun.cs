using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Reconmap.Api.Domain.Entities;

public static class ScanStatus
{
    public const string Queued = "queued";
    public const string Running = "running";
    public const string Succeeded = "succeeded";
    public const string Failed = "failed";
    public const string Partial = "partial";

    public static readonly string[] TaskStatuses = [Queued, Running, Succeeded, Failed];
}

[Table("scan_run")]
public class ScanRun : TimestampedEntity
{
    [Key] public int Id { get; set; }

    public int ProjectId { get; set; }

    public int? CreatedByUid { get; set; }

    [MaxLength(500)] public string Target { get; set; } = string.Empty;

    [MaxLength(30)] public string TargetType { get; set; } = string.Empty;

    [MaxLength(100)] public string Objective { get; set; } = string.Empty;

    public string? Strategy { get; set; }

    [MaxLength(20)] public string Status { get; set; } = ScanStatus.Queued;

    public List<ScanRunTask> Tasks { get; set; } = [];

    /// <summary>
    /// Derives the run status from the statuses of its tasks.
    /// </summary>
    public void RecomputeStatus()
    {
        if (Tasks.Count == 0) return;

        if (Tasks.Any(t => t.Status is ScanStatus.Queued or ScanStatus.Running))
        {
            Status = Tasks.Any(t => t.Status != ScanStatus.Queued) ? ScanStatus.Running : ScanStatus.Queued;
            return;
        }

        var failed = Tasks.Count(t => t.Status == ScanStatus.Failed);
        Status = failed == 0 ? ScanStatus.Succeeded : failed == Tasks.Count ? ScanStatus.Failed : ScanStatus.Partial;
    }
}

[Table("scan_run_task")]
public class ScanRunTask
{
    [Key] public int Id { get; set; }

    public int ScanRunId { get; set; }

    public int Position { get; set; }

    [MaxLength(100)] public string CommandId { get; set; } = string.Empty;

    [MaxLength(200)] public string CommandName { get; set; } = string.Empty;

    [MaxLength(100)] public string CommandUsageId { get; set; } = string.Empty;

    [MaxLength(500)] public string? ExecutablePath { get; set; }

    [MaxLength(1000)] public string? Arguments { get; set; }

    public string? Rationale { get; set; }

    [MaxLength(20)] public string Status { get; set; } = ScanStatus.Queued;

    public string? Error { get; set; }

    [Column(TypeName = "timestamptz")] public DateTime? StartedAt { get; set; }

    [Column(TypeName = "timestamptz")] public DateTime? FinishedAt { get; set; }
}
