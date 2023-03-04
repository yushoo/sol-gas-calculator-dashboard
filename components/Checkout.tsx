import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  createQR,
  encodeURL,
  TransferRequestURLFields,
  findReference,
  validateTransfer,
  FindReferenceError,
  ValidateTransferError,
} from '@solana/pay';
import * as solanaWeb3 from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import {
  Button,
  ButtonGroup,
  Input,
  Box,
  Flex,
  Text,
  Grid,
  GridItem,
  RadioGroup,
  Stack,
  Radio,
  Spinner,
} from '@chakra-ui/react';

type CheckoutProps = {
  updateHasPaid: (newValue: boolean) => void;
  onClose: () => void;
  transactionLimit: number;
  address: string;
};

const Checkout = ({
  updateHasPaid,
  onClose,
  transactionLimit,
  address,
}: CheckoutProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const connection = new solanaWeb3.Connection(
    `https://sparkling-prettiest-sheet.solana-mainnet.discover.quiknode.pro/${process.env.NEXT_PUBLIC_QUICKNODE_APY_KEY}/`
  );

  // Merchant
  const recipient = new solanaWeb3.PublicKey(
    'CwHmEqFeh7EvsRnEk5tqNguHdujKaCdUxg35pWaaGQTx'
  );

  const amount: { [key: number]: BigNumber } = {
    10: BigNumber(0.001),
    250: BigNumber(0.0015),
    500: BigNumber(0.002),
    750: BigNumber(0.0025),
    1000: BigNumber(0.003),
  };

  // Customer
  const reference = new solanaWeb3.Keypair().publicKey;
  const label = 'Solana Gas Fees Calculator';
  const message = 'Your one time calculation';
  const memo = ':)';

  const truncateAddres = (address: string) => {
    const start = address.slice(0, 5);
    const end = address.slice(-5);

    return `${start}...${end}`;
  };

  const url = encodeURL({
    recipient,
    amount: amount[transactionLimit],
    reference,
    label,
    message,
    memo,
  });

  console.log('url: ' + { url });

  useEffect(() => {
    const qr = createQR(url, 512, 'white');

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);
    }
  });

  useEffect(() => {
    console.log('TL: ', transactionLimit);
    console.log('TLMAP: ', amount[transactionLimit]);
  }, [amount, transactionLimit]);

  // check every 0.5s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, reference, {
          finality: 'confirmed',
        });
        // Validate that the transaction has the expected recipient, amount and SPL token
        await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient,
            amount: amount[transactionLimit],
            reference,
          },
          { commitment: 'confirmed' }
        );
        console.log('transaction confirmed');
        updateHasPaid(true);
        onClose();
      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          console.log('transaction not found');
          return;
        }
        if (e instanceof ValidateTransferError) {
          // Transaction is invalid
          console.error('Transaction is invalid', e);
          return;
        }
        console.error('Unknown error', e);
      }
    }, 500);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Flex flexDir='column' alignContent='center' justifyContent='center'>
      <Flex justifyContent='center'>
        <Grid
          templateRows='repeat(3, 1fr)'
          templateColumns='repeat(2, 1fr)'
          gap={1}
          width='70%'
          // paddingX={[4, 5]}
          paddingBottom={[4, 5]}
        >
          <GridItem rowSpan={1} colSpan={1}>
            <Text color='black'> Wallet address: </Text>
          </GridItem>
          <GridItem
            display='flex'
            justifyContent='center'
            rowSpan={1}
            colSpan={1}
          >
            <Text color='black' fontWeight='bold'>
              {truncateAddres(address)}
            </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Text color='black'> # of transactions: </Text>
          </GridItem>
          <GridItem
            display='flex'
            justifyContent='center'
            rowSpan={1}
            colSpan={1}
          >
            <Text color='black' fontWeight='bold'>
              {transactionLimit} transactions
            </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Text color='black'>Fee: </Text>
          </GridItem>
          <GridItem
            display='flex'
            justifyContent='center'
            rowSpan={1}
            colSpan={1}
          >
            <Text color='black' fontWeight='bold'>
              {amount[transactionLimit].toString()} Sol
            </Text>
          </GridItem>
        </Grid>
      </Flex>

      {/* <Flex justifyContent='space-around'>
        <Text color='black'> # of transactions to calculate for: </Text>
        <Text color='black'>{transactionLimit} transactions</Text>
      </Flex>
      <Flex justifyContent='space-around'>
        <Text color='black'>Fee: </Text>
        <Text color='black'>{amount[transactionLimit].toString()} Sol</Text>
      </Flex> */}
      <Box ref={qrRef}></Box>
    </Flex>
  );
};

export default Checkout;
