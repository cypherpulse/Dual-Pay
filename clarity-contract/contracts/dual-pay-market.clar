;; DualPay Market Smart Contract
;; Clarity version 3 compatible

;; Error codes
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-PAYMENT (err u101))
(define-constant ERR-ITEM-NOT-FOUND (err u102))
(define-constant ERR-INSUFFICIENT-QUANTITY (err u103))
(define-constant ERR-NO-EARNINGS (err u104))

;; Data variables
(define-data-var next-item-id uint u1)

;; Maps
(define-map items uint {
  name: (string-ascii 100),
  desc: (string-ascii 200),
  price: uint,
  quantity: uint,
  seller: principal,
  active: bool
})

(define-map seller-stx principal uint)
(define-map seller-sbtc principal uint)

;; Public functions

;; List a new item for sale
(define-public (list-item (name (string-ascii 100)) (desc (string-ascii 200)) (price uint) (quantity uint))
  (let ((item-id (var-get next-item-id)))
    ;; Assert valid inputs
    (asserts! (> (len name) u0) ERR-INVALID-PAYMENT)
    (asserts! (> (len desc) u0) ERR-INVALID-PAYMENT)
    (asserts! (> price u0) ERR-INVALID-PAYMENT)
    (asserts! (> quantity u0) ERR-INSUFFICIENT-QUANTITY)
    
    ;; Store the item
    (map-set items item-id {
      name: name,
      desc: desc,
      price: price,
      quantity: quantity,
      seller: tx-sender,
      active: true
    })
    
    ;; Increment next item id
    (var-set next-item-id (+ item-id u1))
    
    (ok item-id)
  )
)

;; Buy an item
(define-public (buy-item (item-id uint) (quantity-to-buy uint) (pay-with-sbtc bool))
  (let (
    (item (unwrap! (map-get? items item-id) ERR-ITEM-NOT-FOUND))
    (total-cost (* (get price item) quantity-to-buy))
    (seller (get seller item))
  )
    ;; Assert item is active and has sufficient quantity
    (asserts! (get active item) ERR-ITEM-NOT-FOUND)
    (asserts! (>= (get quantity item) quantity-to-buy) ERR-INSUFFICIENT-QUANTITY)
    
    ;; Process payment directly to seller
    (if pay-with-sbtc
      ;; Pay with sBTC directly to seller
      (try! (contract-call? .sbtc-token transfer total-cost tx-sender seller none))
      ;; Pay with STX directly to seller
      (try! (stx-transfer? total-cost tx-sender seller))
    )
    
    ;; Update item quantity
    (let ((new-quantity (- (get quantity item) quantity-to-buy)))
      (map-set items item-id (merge item {
        quantity: new-quantity,
        active: (> new-quantity u0)
      }))
    )
    
    ;; Update seller earnings
    (if pay-with-sbtc
      (map-set seller-sbtc seller (+ (default-to u0 (map-get? seller-sbtc seller)) total-cost))
      (map-set seller-stx seller (+ (default-to u0 (map-get? seller-stx seller)) total-cost))
    )
    
    (ok true)
  )
)

;; Withdraw earnings (no longer needed since payments go directly to sellers)
(define-public (withdraw-earnings)
  (ok true)
)

;; Read-only functions

(define-read-only (get-item (id uint))
  (map-get? items id)
)

(define-read-only (get-next-item-id)
  (var-get next-item-id)
)

(define-read-only (get-seller-stx (seller principal))
  (default-to u0 (map-get? seller-stx seller))
)

(define-read-only (get-seller-sbtc (seller principal))
  (default-to u0 (map-get? seller-sbtc seller))
)