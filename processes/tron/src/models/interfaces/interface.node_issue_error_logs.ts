export interface NodeIssueErrorLogsInterface {
    id: number;
    function: string | null,
    block_number: string | null,
    error: string | null,
    transaction_id: string | null,
    from_adrs: string | null,
    to_adrs: string | null,
    coin_family: number | null,
    extra: string | null
}