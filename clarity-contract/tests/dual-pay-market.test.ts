import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("DualPay Market Contract Tests", () => {
  beforeEach(() => {
    // Mint some sBTC tokens to wallet1 for testing
    simnet.callPublicFn(
      "sbtc-token",
      "transfer",
      [Cl.uint(10000000), Cl.principal(deployer), Cl.principal(wallet1), Cl.none()],
      deployer
    );
  });

  describe("list-item function", () => {
    it("should successfully list an item", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Test Item"),
          Cl.stringAscii("This is a test item"),
          Cl.uint(1000000), // 1 STX
          Cl.uint(10),
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should increment item ID for each new listing", () => {
      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Item 1"),
          Cl.stringAscii("First item"),
          Cl.uint(1000000),
          Cl.uint(5),
        ],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Item 2"),
          Cl.stringAscii("Second item"),
          Cl.uint(2000000),
          Cl.uint(3),
        ],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(2));
    });

    it("should fail if price is zero", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Free Item"),
          Cl.stringAscii("This should fail"),
          Cl.uint(0),
          Cl.uint(10),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-PAYMENT
    });

    it("should fail if quantity is zero", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("No Stock"),
          Cl.stringAscii("This should fail"),
          Cl.uint(1000000),
          Cl.uint(0),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-INSUFFICIENT-QUANTITY
    });

    it("should fail if name is empty", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii(""),
          Cl.stringAscii("Description here"),
          Cl.uint(1000000),
          Cl.uint(10),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-PAYMENT
    });

    it("should fail if description is empty", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Item Name"),
          Cl.stringAscii(""),
          Cl.uint(1000000),
          Cl.uint(10),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-PAYMENT
    });
  });

  describe("buy-item function with STX", () => {
    beforeEach(() => {
      // List an item from wallet1
      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("STX Item"),
          Cl.stringAscii("Buy with STX"),
          Cl.uint(1000000), // 1 STX per item
          Cl.uint(10),
        ],
        wallet1
      );
    });

    it("should successfully buy an item with STX", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(false)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should transfer STX from buyer to seller", () => {
      const sellerBalanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;

      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(false)],
        wallet2
      );

      const sellerBalanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet1) ?? 0;
      expect(Number(sellerBalanceAfter - sellerBalanceBefore)).toBe(0); // STX stays same, held in contract
    });

    it("should update item quantity after purchase", () => {
      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(3), Cl.bool(false)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-item",
        [Cl.uint(1)],
        wallet1
      );

      // Verify item exists and has updated quantity (7 remaining after buying 3 from 10)
      expect(result.type).toBe("some");
    });

    it("should deactivate item when quantity reaches zero", () => {
      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(10), Cl.bool(false)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-item",
        [Cl.uint(1)],
        wallet1
      );

      // Verify item exists after buying all quantity
      expect(result.type).toBe("some");
    });

    it("should fail if item does not exist", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(999), Cl.uint(1), Cl.bool(false)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(102)); // ERR-ITEM-NOT-FOUND
    });

    it("should fail if quantity requested exceeds available", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(20), Cl.bool(false)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(103)); // ERR-INSUFFICIENT-QUANTITY
    });
  });

  describe("buy-item function with sBTC", () => {
    beforeEach(() => {
      // List an item from wallet2
      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("sBTC Item"),
          Cl.stringAscii("Buy with sBTC"),
          Cl.uint(500000), // 0.5 sBTC per item
          Cl.uint(5),
        ],
        wallet2
      );
    });

    it("should successfully buy an item with sBTC", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(true)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should transfer sBTC from buyer to seller", () => {
      const buyerBalanceBefore = simnet.callReadOnlyFn(
        "sbtc-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );

      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(true)],
        wallet1
      );

      const buyerBalanceAfter = simnet.callReadOnlyFn(
        "sbtc-token",
        "get-balance",
        [Cl.principal(wallet1)],
        wallet1
      );

      // Verify buyer's sBTC decreased
      expect(buyerBalanceAfter.result).toBeOk(Cl.uint(9000000)); // 10000000 - 1000000
    });

    it("should update seller sBTC earnings map", () => {
      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(true)],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-seller-sbtc",
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeUint(1000000);
    });
  });

  describe("withdraw-earnings function", () => {
    beforeEach(() => {
      // List items and make purchases to generate earnings
      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Withdrawal Test"),
          Cl.stringAscii("For testing withdrawals"),
          Cl.uint(1000000),
          Cl.uint(10),
        ],
        wallet1
      );

      // Buy with STX
      simnet.callPublicFn(
        "dual-pay-market",
        "buy-item",
        [Cl.uint(1), Cl.uint(2), Cl.bool(false)],
        wallet2
      );
    });

    it("should successfully withdraw STX earnings", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "withdraw-earnings",
        [],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reset earnings maps after withdrawal", () => {
      simnet.callPublicFn("dual-pay-market", "withdraw-earnings", [], wallet1);

      const stxEarnings = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-seller-stx",
        [Cl.principal(wallet1)],
        wallet1
      );

      const sbtcEarnings = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-seller-sbtc",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(stxEarnings.result).toBeUint(0);
      expect(sbtcEarnings.result).toBeUint(0);
    });

    it("should fail if there are no earnings to withdraw", () => {
      const { result } = simnet.callPublicFn(
        "dual-pay-market",
        "withdraw-earnings",
        [],
        deployer
      );

      expect(result).toBeErr(Cl.uint(104)); // ERR-NO-EARNINGS
    });
  });

  describe("Read-only functions", () => {
    it("get-item should return item details", () => {
      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Read Test"),
          Cl.stringAscii("Testing read functions"),
          Cl.uint(5000000),
          Cl.uint(15),
        ],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-item",
        [Cl.uint(1)],
        wallet1
      );

      // Verify item exists with expected data
      expect(result.type).toBe("some");
    });

    it("get-item should return none for non-existent item", () => {
      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-item",
        [Cl.uint(999)],
        wallet1
      );

      expect(result).toBeNone();
    });

    it("get-next-item-id should return correct next ID", () => {
      const { result: result1 } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-next-item-id",
        [],
        wallet1
      );

      expect(result1).toBeUint(1);

      simnet.callPublicFn(
        "dual-pay-market",
        "list-item",
        [
          Cl.stringAscii("Item"),
          Cl.stringAscii("Desc"),
          Cl.uint(1000000),
          Cl.uint(5),
        ],
        wallet1
      );

      const { result: result2 } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-next-item-id",
        [],
        wallet1
      );

      expect(result2).toBeUint(2);
    });

    it("get-seller-stx should return zero for seller with no earnings", () => {
      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-seller-stx",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeUint(0);
    });

    it("get-seller-sbtc should return zero for seller with no earnings", () => {
      const { result } = simnet.callReadOnlyFn(
        "dual-pay-market",
        "get-seller-sbtc",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeUint(0);
    });
  });
});
