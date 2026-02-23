from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from config import config
# import requests # For real API calls if needed, though atlassian-python-api is preferred

class IntegrationClient(ABC):
    @abstractmethod
    def fetch_requirements(self, query: str) -> List[Dict]:
        """Fetches requirements from external source (Jira/Confluence)."""
        pass

class MockIntegrationClient(IntegrationClient):
    def fetch_requirements(self, query: str) -> List[Dict]:
        """Returns hardcoded requirements for the Trading Engine."""
        # Simple mock logic: return all if generic query, or filter based on keywords
        requirements = [
            {
                "id": "REQ-001",
                "title": "Market Data Module Implementation",
                "content": """
# Market Data Module Specification

## Overview
The Market Data Module is responsible for ingesting, parsing, and normalizing market data feeds.

## Requirements
1.  **Interface**:
    -   Must implement `MarketDataProvider` abstract base class.
    -   Method `get_price(symbol: str) -> float`.
    -   Method `subscribe(symbol: str, callback: Callable)`.

2.  **Data Sources**:
    -   Support a simulated `CSVFeed` that reads from a local CSV file.
    -   CSV Format: `symbol,price,timestamp`.

3.  **Error Handling**:
    -   Raise `SymbolNotFoundException` if symbol is invalid.
    -   Handle missing data gracefully (return None or last known price).

4.  **Testing**:
    -   Unit tests for CSV parsing.
    -   Mock the file system for tests.
"""
            },
            {
                "id": "REQ-002",
                "title": "Account Module Implementation",
                "content": """
# Account Module Specification

## Overview
Manages user accounts, balances, and positions.

## Requirements
1.  **Account Class**:
    -   Properties: `account_id`, `balance`, `positions` (Dict[symbol, quantity]).
    -   Methods:
        -   `deposit(amount: float)`
        -   `withdraw(amount: float)`: Raise `InsufficientFundsException` if balance is low.
        -   `update_position(symbol: str, quantity: float, price: float)`: Adjust balance and position size.

2.  **Persistence**:
    -   In-memory storage for MVP.
    -   Optional: SQLite support.

3.  **Validation**:
    -   Balance cannot be negative.
"""
            },
            {
                "id": "REQ-003",
                "title": "Strategy Module Implementation",
                "content": """
# Strategy Module Specification

## Overview
Defines trading strategies that signal buy/sell actions based on market data.

## Requirements
1.  **Base Strategy Interface**:
    -   `on_tick(symbol: str, price: float) -> Optional[Signal]`
    -   Signal structure: `symbol`, `action` (BUY/SELL), `quantity`.

2.  **Simple Moving Average (SMA) Strategy**:
    -   Parameters: `window_size` (int).
    -   Logic:
        -   Calculate moving average of last N prices.
        -   If price > SMA and not held: BUY.
        -   If price < SMA and held: SELL.
"""
            },
            {
                "id": "REQ-004",
                "title": "Trading Engine Core Implementation",
                "content": """
# Trading Engine Core Specification

## Overview
Orchestrates the interaction between Market Data, Strategy, and Account modules.

## Requirements
1.  **Engine Class**:
    -   Initialize with `MarketDataProvider`, `Account`, `Strategy`.
    -   `start()`: Begin processing data.
    -   `stop()`: Stop processing.

2.  **Execution Logic**:
    -   Subscribe to market data.
    -   On price update:
        -   Pass to Strategy `on_tick`.
        -   If Signal received:
            -   Validate against Account (check funds/positions).
            -   Execute trade (update Account).
            -   Log trade execution.

3.  **Main Entry Point**:
    -   `main.py` should setup the engine and run a simulation with `CSVFeed` and `SMAStrategy`.
"""
            }
        ]
        
        # Simple filtering
        if query:
            return [r for r in requirements if query.lower() in r["title"].lower() or query.lower() in r["content"].lower()]
        return requirements


class JiraConfluenceClient(IntegrationClient):
    def __init__(self):
        self.mock_client = MockIntegrationClient()
        # Initialize real client if credentials exist
        self.real_client_configured = all([config.JIRA_URL, config.JIRA_USERNAME, config.JIRA_TOKEN])
        
    def fetch_requirements(self, query: str) -> List[Dict]:
        if self.real_client_configured:
            # Here we would implement the real Atlassian API call
            # For now, we fallback to mock to ensure the MVP works unless fully configured
            # In a real scenario, this would use `atlassian.Jira` and `atlassian.Confluence`
            print("Real Jira/Confluence client configured but using Mock for MVP stability/safety.")
            return self.mock_client.fetch_requirements(query)
        else:
            return self.mock_client.fetch_requirements(query)

def get_integration_client() -> IntegrationClient:
    return JiraConfluenceClient()
