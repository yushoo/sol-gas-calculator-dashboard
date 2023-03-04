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
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import * as solanaWeb3 from '@solana/web3.js';
import axios from 'axios';

type SolGasFeeCalculatorProps = {
  updateHasPaid: (newValue: boolean) => void;
  onOpen: () => void;
  handleSetTransactionLimit: (transactionLimit: number) => void;
  handleSetAddress: (address: string) => void;
  hasPaid: Boolean;
  transactionLimit: number;
  address: string;
};

const SolGasFeeCalculator = ({
  updateHasPaid,
  onOpen,
  handleSetTransactionLimit,
  handleSetAddress,
  hasPaid,
  transactionLimit,
  address,
}: SolGasFeeCalculatorProps) => {
  const [transactions, setTransactions] = useState<object[] | null>(null);
  const [gasFees, setGasFees] = useState<number | null>(null);
  const [solanaPrice, setSolanaPrice] = useState<number | null>(null);
  const toast = useToast();
  const [isGetTransLoading, setIsGetTransLoading] = useState(false);
  const [hasSubmit, setHasSubmit] = useState<boolean>(false);
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);

  const checkIsValidAddress = async () => {
    try {
      const publicKey = new solanaWeb3.PublicKey(`${address}`);
      setIsValidAddress(true);
      console.log('publicKey: ', publicKey);
      return true;
    } catch (error) {
      setIsValidAddress(false);
      return false;
    }
  };

  // event handlers
  const handleAddressInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleSetAddress(event.target.value);
    console.log(address);
  };
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    // The value of state variables only changes after a re-render
    const newLimit = Number(event.target.value);
    handleSetTransactionLimit(newLimit);
    console.log(newLimit);
  };
  // handle pay & submit
  function showErrorToast() {
    toast({
      title: 'Error: Invalid address',
      description: 'Please input a valid public key',
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  }

  const handlePayAndSubmit = async () => {
    if (await checkIsValidAddress()) {
      onOpen();
    } else {
      console.log('INVALID PUB ADDRESS');
      showErrorToast();
    }
  };

  // Queries
  const fetchSolanaTokenPrice = async () => {
    try {
      const res = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      console.log(res.data['solana'].usd);
      setSolanaPrice(res.data['solana'].usd);
    } catch (err) {
      console.log(err);
    }
  };

  const getTransactions = async () => {
    setIsGetTransLoading(true);
    const publicKey = new solanaWeb3.PublicKey(`${address}`);

    const solana = new solanaWeb3.Connection(
      `https://sparkling-prettiest-sheet.solana-mainnet.discover.quiknode.pro/${process.env.NEXT_PUBLIC_QUICKNODE_APY_KEY}/`
    );

    const LAMPORTS_PER_SOL = solanaWeb3.LAMPORTS_PER_SOL;
    console.log(await solana.getAccountInfo(publicKey));
    console.log((await solana.getBalance(publicKey)) / LAMPORTS_PER_SOL);
    // TODO add limit on # of signatures retrieved
    const transSignatures = await solana.getSignaturesForAddress(publicKey, {
      limit: transactionLimit,
    });
    // solana.getParsedTransactions
    // console.log(transSignatures);
    const transactions = [];
    let totalGasFees = 0;
    for (let i = 0; i < transSignatures.length; i++) {
      const signature = transSignatures[i].signature;
      const confirmedTransaction = await solana.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      if (confirmedTransaction) {
        const { meta } = confirmedTransaction;
        if (meta) {
          totalGasFees += meta?.fee;
          console.log(totalGasFees);
          const oldBalance = meta.preBalances;
          const newBalance = meta.postBalances;
          const amount = oldBalance[0] - newBalance[0];
          const transWithSignature = {
            signature,
            ...confirmedTransaction,
            fees: meta?.fee,
            amount,
          };
          transactions.push(transWithSignature);
        }
      }
    }
    setTransactions(transactions);
    setGasFees(totalGasFees / LAMPORTS_PER_SOL);
    setIsGetTransLoading(false);
  };

  useEffect(() => {
    fetchSolanaTokenPrice();
  });

  useEffect(() => {
    if (hasPaid) {
      getTransactions();
      setHasSubmit(true);
      updateHasPaid(false);
    }
  }, [hasPaid]);

  return (
    <>
      {/* TODO: This is where the user will type an address and where the visual to show the calculate total gas will be shown */}
      <Input
        bg='white'
        color='black'
        placeholder='Enter your address here'
        margin={[2, 3]}
        onChange={handleAddressInput}
      />
      <RadioGroup defaultValue='500' marginTop={[1, 2]} marginBottom={[1, 2]}>
        <Stack spacing={4} direction='row'>
          <Text>Number of Transactions: </Text>
          <Radio value='10' onChange={handleRadioChange}>
            10
          </Radio>
          <Radio value='250' onChange={handleRadioChange}>
            250
          </Radio>
          <Radio value='500' onChange={handleRadioChange}>
            500
          </Radio>
          <Radio value='750' onChange={handleRadioChange}>
            750
          </Radio>
          <Radio value='1000' onChange={handleRadioChange}>
            1000
          </Radio>
        </Stack>
      </RadioGroup>
      {/* <Button colorScheme='teal' margin={[2, 3]} submi>
    Checkout
  </Button> */}
      <Button
        colorScheme='teal'
        margin={[2, 3]}
        onClick={
          handlePayAndSubmit
          // await getTransactions();
          // setHasSubmit(true);
        }
      >
        Pay & Submit
      </Button>

      <Flex
        flexDirection='column'
        border='1px'
        borderColor='black'
        borderRadius='5px'
        padding='1rem 1rem'
        margin={[2, 3]}
      >
        <Grid
          templateRows='repeat(4, 1fr)'
          templateColumns='repeat(5, 75px)'
          gap={5}
          paddingX={[4, 5]}
          paddingBottom={[4, 5]}
        >
          <GridItem rowSpan={1} colSpan={5}>
            <Flex justifyContent='center'>
              <Text>Results</Text>
            </Flex>
          </GridItem>
          <GridItem rowSpan={1} colSpan={4}>
            <Text>Transactions Retrieved: </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Flex justifyContent='center' marginLeft={[5, 6]}>
              {isGetTransLoading ? (
                <Spinner />
              ) : transactions != null ? (
                <Text>{transactions.length}</Text>
              ) : (
                <Text>--</Text>
              )}
            </Flex>
          </GridItem>
          <GridItem rowSpan={1} colSpan={4}>
            <Text>Sol Gas Fees: </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Flex justifyContent='center'>
              <Flex justifyContent='center' marginLeft={[5, 6]}>
                {isGetTransLoading ? (
                  <Spinner />
                ) : (
                  <Text>{gasFees || '--'}</Text>
                )}
              </Flex>
            </Flex>
          </GridItem>
          <GridItem rowSpan={1} colSpan={4}>
            {/* TODO */}
            <Text>Gas Fees in USD: </Text>
          </GridItem>
          <GridItem rowSpan={1} colSpan={1}>
            <Flex justifyContent='center' marginLeft={[5, 6]}>
              {isGetTransLoading ? (
                <Spinner />
              ) : (
                <Text>
                  {gasFees && solanaPrice
                    ? `$${(gasFees * solanaPrice).toFixed(7)}`
                    : '--'}
                </Text>
              )}
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </>
  );
};

export default SolGasFeeCalculator;
