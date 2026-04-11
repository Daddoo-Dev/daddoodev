export type MaSignal = {
	price: number;
	ma: number;
	signal: 'HOLD' | 'EXIT';
	pct_above_ma: number;
	drawdown_pct: number;
};

export type Overbought = {
	z_score: number;
	upper_band: number;
	status: 'OVERBOUGHT' | 'STRETCHED' | 'NORMAL';
};

export type PortfolioRow = AnalyzedSymbol & { holding: Holding | null };

export type TrendBlock = {
	short: MaSignal | null;
	medium: MaSignal | null;
	long: MaSignal | null;
	composite: string;
	overbought: Overbought | null;
};

export type RelativeStrength = {
	rs_3m: number;
	rs_6m: number;
	stock_3m: number;
	spy_3m: number;
	status: 'OUTPERFORMING' | 'UNDERPERFORMING' | 'IMPROVING' | 'FADING';
};

export type VolumeBlock = {
	volume_ratio: number;
	avg_volume: number;
	current_volume: number;
	level: 'HEAVY' | 'ELEVATED' | 'THIN' | 'NORMAL';
};

export type MomentumBlock = {
	roc_1m: number;
	roc_3m: number;
	roc_6m: number;
	status:
		| 'ACCELERATING'
		| 'STEADY'
		| 'LOSING MOMENTUM'
		| 'DECLINING'
		| 'RECOVERING';
};

export type EntrySignal = {
	signal: 'GOOD ENTRY' | 'FAIR ENTRY';
	score: number;
	reasons: string[];
};

export type AnalysisBlock = {
	relative_strength: RelativeStrength | null;
	volume: VolumeBlock | null;
	momentum: MomentumBlock | null;
	entry: EntrySignal | null;
};

export type Holding = {
	symbol: string;
	quantity: number;
	cost_per_share: number;
	cost_basis: number;
	market_value: number;
	total_gain: number;
	unrealized_gain_pct: number;
};

export type WatchlistItem = {
	symbol: string;
	sold_price?: number;
	sold_date?: string;
};

export type BuyVerdict = {
	verdict: 'BUY' | 'CONSIDER' | 'WAIT' | 'AVOID' | 'N/A';
	reasons: string[];
};

export type AnalyzedSymbol = {
	symbol: string;
	error: string | null;
	trend: TrendBlock | null;
	analysis: AnalysisBlock | null;
	verdict?: BuyVerdict;
};

export type DiscoveryRow = {
	symbol: string;
	verdict: 'BUY' | 'CONSIDER';
	reasons: string[];
	rank_score: number;
	composite: string;
	price: number | null;
	ma_10mo: number | null;
	entry: EntrySignal | null;
};

export type DiscoveryResults = {
	generated_at: string;
	universe: string;
	universe_size: number;
	after_exclusions: number;
	scanned: number;
	shortlist: number;
	max_share_price: number | null;
	results: DiscoveryRow[];
};
