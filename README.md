https://docs.solana.com/cluster/rpc-endpoints

https://github.com/arddluma/awesome-list-rpc-nodes-providers#solana

https://stackoverflow.com/questions/70028880/i-would-like-to-get-all-transactions-given-an-address

https://www.youtube.com/watch?v=pN-bx6NfDmg&ab_channel=QuickNode

https://docs.solanapay.com/core/transfer-request/merchant-integration

https://www.pointer.gg/tutorials/solana-pay-irl-payments/20d91ef3-542c-4d51-9f68-ed483928696e

# Todos

### In progress

- [] Add valid wallet validation before submit

- [x] Add costs and memo in checkout
- [x] Add customizable payment
- [x] Move api key to .env file
- [] Understand if I reuse the established connection of solana instead of using the solanaWeb3 object
- [x] Create loop so user can pay for another calculation
- [x] Detect the payment
- [x] Refactor the index page with components
- [x] Create mvp UI
  - [x] Form for inputting address
  - [x] Radio buttons for selecting # of transactions
  - [x] Results display
- [x] Create and add logic for calculating gas fees
- [x] Find ways to add a pay wall

  - [x] Look into Solana pay or create a smart contract
    - Seems like Solana pay serves my purpose
    - If I ever need to create a subscription model I can just use a DB to store the addresses rather than creating a smart contract to store on chain.
      The latter seems to require more research and experimentation.

- Make the payment conditional based on the amount of transactions user wants to calculate gas fees for. Make the payment a modal
