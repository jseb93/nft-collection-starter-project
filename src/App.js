import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const CONTRACT_ADDRESS = "0x5a4917740e388be86cd8e95bb8881445a1f75598";
const TWITTER_HANDLE = 'gutter_crypto';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/tokenId`;
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [counter, setCounter] = useState(0);
  const [maxId, setMaxId] = useState(0);
  
  // renderNotConnectedContainer メソッドを定義します。
  const setupMintCounter = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        const counter = Number(await connectedContract.getCounter());
        const max = Number(await connectedContract.getMaxId());
        setCounter(counter);
        setMaxId(max);
      }
      else{
        console.log("no ethereum object");
      }
      } catch(error){
      console.log(error);
    }
  };


  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if (!ethereum) {
      console.log("Make sure you have metamask")
      return;
    } else{
      console.log("We have the ethereum object", ethereum);

      const accounts = await ethereum.request({method: "eth_accounts"});
      if (accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorized account: ", account);      
        setCurrentAccount(account);
        await setupMintCounter();
        setupEventListener();
      } else{
        console.log("No authorized account found");
      }
    }
  };

  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get Metamask!");
        return;
      } else {
        const accounts = await ethereum.request({method: "eth_requestAccounts"});
        setCurrentAccount(accounts[0]);
        await setupMintCounter();
        setupEventListener();
      }
    } catch(error){
      console.log(error);
    }
  };

  const setupEventListener = () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        connectedContract.on("NewEpicNFTMinted", (from, tokenId)=>{
          console.log(from, tokenId);
          alert(
            `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setCounter(tokenId.toNumber()+1);
        });
        console.log("setup event listener");
      }
      else{
        console.log("no ethereum object");
      }
      } catch(error){
      console.log(error);
    }
  }

  const askContractToMintNft = async() => {
    try{
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer,
        );
        console.log("Going to pop wallet now to pay gas...");
        let txn = await connectedContract.makeAnEpicNFT();
        console.log("Minting...");
        await txn.wait();
        console.log("Minted. txhash: ", txn.hash);
      } else{
        console.log("ethereum object does not exist");
      }
    }catch(error){
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div>
       <p className="sub-text">
        Remaining [{maxId-counter}/{maxId}]
      </p>
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
    </div>
  );


  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          {
            currentAccount==="" ? (
              renderNotConnectedContainer()
            ) : (
              renderConnectedContainer()
            )
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
