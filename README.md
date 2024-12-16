# Smart Portfolio Management Backend

This backend service provides API endpoints to interact with the Smart Portfolio Management smart contracts.

## Setup

Make sure the sma-contracts are running.

1. Install dependencies: 

```bash
npm install
```

2. Run the server:

```bash
npm run dev
```
## API Documentation

The API documentation is available at `http://localhost:3001/api-docs` when the server is running.

## API Endpoints with Example Calls

### 1. Create Model Portfolio

Creates a new model portfolio with specified fund allocations.

```bash
curl -X POST http://localhost:3001/api/portfolio/model \
-H "Content-Type: application/json" \
-d '{
"fundAddresses": [
"0x5FbDB2315678afecb367f032d93F642f64180aa3", # USDC Token
"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", # Real Estate Token
"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" # Private Equity Token
],
"weights": [3000, 5000, 2000] # 30%, 50%, 20%
}'
```


### 2. Get Model Portfolio Details

Retrieves details of a specific model portfolio.

```bash
curl http://localhost:3001/api/portfolio/model/1
```


### 3. Update Model Portfolio

Updates an existing model portfolio's allocations.
Example call:
```bash
curl -X PUT http://localhost:3001/api/portfolio/model/1 \
-H "Content-Type: application/json" \
-d '{
"fundAddresses": [
"0x5FbDB2315678afecb367f032d93F642f64180aa3", # USDC Token
"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", # Real Estate Token
"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" # Private Equity Token
],
"weights": [3000, 5000, 2000] # 30%, 50%, 20%
}'
```


### 4. Assign Portfolio to Investor

Links an investor address to a model portfolio.

```bash
curl -X POST http://localhost:3001/api/portfolio/assign \
-H "Content-Type: application/json" \
-d '{
"investor": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
"portfolioId": 1,
"stablecoin": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}'
```


### 5. Deposit Funds

Deposits funds into an investor's portfolio.

```bash
curl -X POST http://localhost:3001/api/portfolio/deposit \
-H "Content-Type: application/json" \
-d '{
"investor": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
"amount": "1000000000" # 1000 USDC (6 decimals)
}'
```


### 6. Withdraw Funds

Withdraws funds from an investor's portfolio.

```bash
curl -X POST http://localhost:3001/api/portfolio/withdraw \
-H "Content-Type: application/json" \
-d '{
"investor": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
"amount": "1000000000" # 1000 USDC (6 decimals)
}'
```


### 7. Get Portfolio Value

Retrieves the current value of an investor's portfolio.

```bash
curl http://localhost:3001/api/portfolio/value/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```


## Important Notes

1. The example addresses are from a local Hardhat network. Use appropriate addresses for your deployment.
2. Weights are in basis points (100 = 1%). Total weights must equal 10000 (100%).
3. USDC amounts use 6 decimal places (1000000 = 1 USDC).
4. The investor address in examples is the default first account from Hardhat.
5. Make sure your local Hardhat node is running and contracts are deployed before testing.

## Testing Flow

1. Create a model portfolio
2. Verify portfolio creation by getting its details
3. Assign the portfolio to an investor
4. Deposit funds to test automatic allocation
5. Check portfolio value to verify allocations
6. Update model portfolio to test rebalancing
7. Withdraw funds to test proportional withdrawals

## Error Handling

All endpoints return:
- 200 OK for successful operations
- 500 Internal Server Error with an error message for failures

Example error response:

```json
{
"error": "Failed to deposit: Insufficient balance"
}
```
