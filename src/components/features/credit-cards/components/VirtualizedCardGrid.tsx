import { useTranslations } from "next-intl";
import React, { useCallback, useMemo } from "react";
import { Grid } from "react-window";
import { cn } from "@/lib/utils";
import "react-window/dist/styles.css";
import type { CreditCard } from "@/types/credit-card";
import CreditCardComponent from "../../credit-card/CreditCard";

interface VirtualizedCardGridProps {
  cards: CreditCard[];
  columns: number;
  rowHeight: number;
  columnWidth: number;
  height: number;
  onCardClick?: (card: CreditCard) => void;
  onCompareToggle?: (cardId: string) => void;
  comparisonCards: CreditCard[];
  viewMode?: "grid" | "list" | "compact";
  className?: string;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  cards: CreditCard[];
  columns: number;
  columnWidth: number;
  rowHeight: number;
  onCardClick?: (card: CreditCard) => void;
  onCompareToggle?: (cardId: string) => void;
  comparisonCards: CreditCard[];
  viewMode?: "grid" | "list" | "compact";
}

// Grid component for react-window
const GridItem = ({
  columnIndex,
  rowIndex,
  style,
  data,
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    cards: CreditCard[];
    columns: number;
    columnWidth: number;
    rowHeight: number;
    onCardClick?: (card: CreditCard) => void;
    onCompareToggle?: (cardId: string) => void;
    comparisonCards: CreditCard[];
    viewMode?: "grid" | "list" | "compact";
  };
}) => {
  const {
    cards,
    columns,
    onCardClick,
    onCompareToggle,
    comparisonCards,
    viewMode,
  } = data;
  const cardIndex = rowIndex * columns + columnIndex;
  const card = cards[cardIndex];

  if (!card) {
    return <div />;
  }

  const isInComparison = comparisonCards.some((c) => c.id === card.id);

  return (
    <div style={style} className="p-2">
      <CreditCardComponent
        card={card}
        viewMode={viewMode === "compact" ? "compact" : viewMode}
        onCardClick={() => onCardClick?.(card)}
        onCompare={() => onCompareToggle?.(card.id)}
        isInComparison={isInComparison}
        className="h-full"
      />
    </div>
  );
};

export const VirtualizedCardGrid: React.FC<VirtualizedCardGridProps> = ({
  cards,
  columns,
  rowHeight,
  columnWidth,
  height,
  onCardClick,
  onCompareToggle,
  comparisonCards,
  viewMode = "grid",
  className,
}) => {
  const t = useTranslations();

  // Calculate grid dimensions
  const rowCount = Math.ceil(cards.length / columns);
  const width = columns * columnWidth;

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo(
    () => ({
      cards,
      columns,
      columnWidth,
      rowHeight,
      onCardClick,
      onCompareToggle,
      comparisonCards,
      viewMode,
    }),
    [
      cards,
      columns,
      columnWidth,
      rowHeight,
      onCardClick,
      onCompareToggle,
      comparisonCards,
      viewMode,
    ],
  );

  // Memoize the Grid component to prevent recreation
  const GridComponent = useMemo(
    () =>
      React.createElement(Grid as any, {
        columnCount: columns,
        rowCount: rowCount,
        columnWidth: columnWidth,
        rowHeight: rowHeight,
        width: width,
        height: height,
        itemData: itemData,
        className: "outline-none",
        cellComponent: GridItem as any,
      }),
    [columns, rowCount, width, height, columnWidth, rowHeight, itemData],
  );

  if (cards.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <p className="text-muted-foreground">{t("noResults")}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-auto", className)}>
      <div style={{ width, height }}>{GridComponent}</div>
    </div>
  );
};

export default VirtualizedCardGrid;
