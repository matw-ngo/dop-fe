import { useCallback, useMemo } from "react";
import { vietnameseCreditCards } from "@/data/credit-cards";
import type { CreditCard } from "@/types/credit-card";

export interface ComparisonWeights {
  annualFee: number;
  rewardsRate: number;
  interestRate: number;
  creditLimit: number;
  features: number;
}

export interface ComparisonData {
  cards: CreditCard[];
  features: string[];
  bestValues: {
    lowestAnnualFee?: string;
    lowestInterestRate?: string;
    highestRewardsRate?: string;
    highestCreditLimit?: string;
    lowestWithdrawalFee?: string;
    lowestForeignExchangeFee?: string;
  };
  cardScores: Record<string, number>;
  getBestCard: () => string | undefined;
  getApprovalOdds: (card: CreditCard) => number;
  formatCurrency: (amount: number) => string;
}

export interface UseComparisonDataOptions {
  weights?: Partial<ComparisonWeights>;
  locale?: string;
  currency?: string;
}

const DEFAULT_WEIGHTS: ComparisonWeights = {
  annualFee: 0.25,
  rewardsRate: 0.25,
  interestRate: 0.2,
  creditLimit: 0.15,
  features: 0.15,
};

export const useComparisonData = (
  cardIds: string[],
  options: UseComparisonDataOptions = {},
): ComparisonData => {
  const {
    weights: customWeights = {},
    locale = "vi-VN",
    currency = "VND",
  } = options;

  // Merge custom weights with defaults
  const weights = useMemo(
    () => ({
      ...DEFAULT_WEIGHTS,
      ...customWeights,
    }),
    [customWeights],
  );

  // Get cards to compare
  const cards = useMemo(() => {
    if (!cardIds || cardIds.length === 0) {
      console.warn("No card IDs provided for comparison");
      return [];
    }

    const foundCards: CreditCard[] = [];
    const notFoundIds: string[] = [];

    cardIds.forEach((id) => {
      const card = vietnameseCreditCards.find((card) => card.id === id);
      if (card) {
        foundCards.push(card);
      } else {
        notFoundIds.push(id);
      }
    });

    if (notFoundIds.length > 0) {
      console.warn(`Cards not found with IDs: ${notFoundIds.join(", ")}`);
    }

    return foundCards;
  }, [cardIds]);

  // Extract all unique features from cards being compared
  const features = useMemo(() => {
    return Array.from(new Set(cards.flatMap((card) => card.features)));
  }, [cards]);

  // Calculate best values for each metric
  const bestValues = useMemo(() => {
    if (cards.length === 0) return {};

    const findBest = (metric: keyof CreditCard, isLowerBetter = false) => {
      const values = cards
        .map((card) => card[metric] as number)
        .filter((v) => typeof v === "number");
      if (values.length === 0) return undefined;

      const bestValue = isLowerBetter
        ? Math.min(...values)
        : Math.max(...values);
      const bestCard = cards.find((card) => card[metric] === bestValue);
      return bestCard?.id;
    };

    // Best rewards rate (highest)
    const bestRewardsRate = cards.reduce(
      (best, card) => {
        const rate = card.rewardsProgram?.earnRate || 0;
        return rate > (best.rate || 0) ? { cardId: card.id, rate } : best;
      },
      { cardId: "", rate: 0 },
    );

    return {
      lowestAnnualFee: findBest("annualFee", true),
      lowestInterestRate: findBest("interestRate", true),
      highestRewardsRate: bestRewardsRate.cardId,
      highestCreditLimit: findBest("creditLimitMax"),
      lowestWithdrawalFee: findBest("withdrawalFee", true),
      lowestForeignExchangeFee: findBest("foreignExchangeFee", true),
    };
  }, [cards]);

  // Pre-calculate min/max values for normalization (calculated once)
  const normalizationValues = useMemo(() => {
    if (cards.length === 0) {
      return {
        minFee: 0,
        maxFee: 0,
        minRate: 0,
        maxRate: 0,
        minRewards: 0,
        maxRewards: 0,
        minLimit: 0,
        maxLimit: 0,
        maxFeatures: 0,
      };
    }

    const annualFees = cards.map((c) => c.annualFee).filter((v) => v > 0);
    const interestRates = cards.map((c) => c.interestRate).filter((v) => v > 0);
    const rewardsRates = cards.map((c) => c.rewardsProgram?.earnRate || 0);
    const creditLimits = cards.map((c) => c.creditLimitMax);

    return {
      minFee: annualFees.length > 0 ? Math.min(...annualFees) : 0,
      maxFee: annualFees.length > 0 ? Math.max(...annualFees) : 0,
      minRate: interestRates.length > 0 ? Math.min(...interestRates) : 0,
      maxRate: interestRates.length > 0 ? Math.max(...interestRates) : 0,
      minRewards: rewardsRates.length > 0 ? Math.min(...rewardsRates) : 0,
      maxRewards: rewardsRates.length > 0 ? Math.max(...rewardsRates) : 0,
      minLimit: creditLimits.length > 0 ? Math.min(...creditLimits) : 0,
      maxLimit: creditLimits.length > 0 ? Math.max(...creditLimits) : 0,
      maxFeatures: Math.max(...cards.map((c) => c.features.length)),
    };
  }, [cards]);

  // Calculate overall scores based on weights using pre-calculated min/max values
  const cardScores = useMemo(() => {
    if (cards.length === 0) return {};

    const {
      minFee,
      maxFee,
      minRate,
      maxRate,
      minRewards,
      maxRewards,
      minLimit,
      maxLimit,
      maxFeatures,
    } = normalizationValues;

    return cards.reduce(
      (scores, card) => {
        let score = 0;

        // Normalize and weigh each factor (0-100 scale)
        if (card.annualFee > 0 && maxFee > minFee) {
          const feeScore =
            ((maxFee - card.annualFee) / (maxFee - minFee)) * 100;
          score += feeScore * weights.annualFee;
        }

        if (card.interestRate > 0 && maxRate > minRate) {
          const rateScore =
            ((maxRate - card.interestRate) / (maxRate - minRate)) * 100;
          score += rateScore * weights.interestRate;
        }

        const rewardsRate = card.rewardsProgram?.earnRate || 0;
        if (maxRewards > minRewards) {
          const rewardsScore =
            ((rewardsRate - minRewards) / (maxRewards - minRewards)) * 100;
          score += rewardsScore * weights.rewardsRate;
        }

        if (maxLimit > minLimit) {
          const limitScore =
            ((card.creditLimitMax - minLimit) / (maxLimit - minLimit)) * 100;
          score += limitScore * weights.creditLimit;
        }

        if (maxFeatures > 0) {
          const featuresScore = (card.features.length / maxFeatures) * 100;
          score += featuresScore * weights.features;
        }

        scores[card.id] = Math.round(score);
        return scores;
      },
      {} as Record<string, number>,
    );
  }, [cards, weights, normalizationValues]);

  // Get the card with the highest overall score
  const getBestCard = useCallback(() => {
    const entries = Object.entries(cardScores);
    if (entries.length === 0) return undefined;
    return entries.reduce(
      (best, [cardId, score]) =>
        score > (best.score || 0) ? { cardId, score } : best,
      { cardId: "", score: 0 },
    ).cardId;
  }, [cardScores]);

  // Calculate approval odds based on card requirements
  const getApprovalOdds = useCallback((card: CreditCard) => {
    // Simple heuristic based on annual fee and income requirements
    let odds = 50; // Base odds

    // Adjust based on annual fee (lower fee = higher odds)
    if (card.annualFee === 0) {
      odds += 35;
    } else if (card.annualFee < 1000000) {
      odds += 25;
    } else if (card.annualFee < 3000000) {
      odds += 15;
    }

    // Adjust based on minimum income requirement
    if (card.incomeRequiredMin < 5000000) {
      odds += 10;
    } else if (card.incomeRequiredMin < 10000000) {
      odds += 5;
    }

    // Ensure odds stay within bounds
    return Math.min(Math.max(odds, 20), 95);
  }, []);

  // Format currency based on locale
  const formatCurrency = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    },
    [locale, currency],
  );

  return {
    cards,
    features,
    bestValues,
    cardScores,
    getBestCard,
    getApprovalOdds,
    formatCurrency,
  };
};
