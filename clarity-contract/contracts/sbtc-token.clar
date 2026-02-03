;; Mock sBTC Token Contract for testing
;; SIP-010 compliant

(define-fungible-token sbtc-token)

(define-constant contract-owner tx-sender)

;; Transfer function
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq from tx-sender) (err u1))
    (asserts! (> amount u0) (err u2))
    (try! (ft-transfer? sbtc-token amount tx-sender to))
    (print memo)
    (ok true)
  )
)

;; Read-only function to get balance
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance sbtc-token account))
)

;; Mint some tokens for testing
(ft-mint? sbtc-token u1000000000000 contract-owner)