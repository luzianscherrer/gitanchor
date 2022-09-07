import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GitAnchor", function () {
  async function deployGitAnchorFixture() {
    const [signer] = await ethers.getSigners();

    const GitAnchor = await ethers.getContractFactory("GitAnchor");
    const gitAnchor = await GitAnchor.deploy();

    return { gitAnchor, signer };
  }

  it("Should be able to store and retrieve an anchor", async function () {
    const { gitAnchor, signer } = await loadFixture(deployGitAnchorFixture);

    const hash = 'f5081c3cc312b53c035fa3d341d8fd90d7941fb1';

    await gitAnchor.setAnchor(hash);

    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    const timestamp = block.timestamp;

    const anchor = await gitAnchor.getAnchor(hash);
    expect(anchor[0].toNumber()).to.equal(timestamp);
    expect(anchor[1]).to.equal(signer.address);
  });

  it("Should know if an anchor is stored or not", async function () {
    const { gitAnchor } = await loadFixture(deployGitAnchorFixture);

    const hash = 'f5081c3cc312b53c035fa3d341d8fd90d7941fb1';

    await gitAnchor.setAnchor(hash);
    expect(await gitAnchor.isAnchored(hash)).to.equal(true);
    expect(await gitAnchor.isAnchored('dead1c3cc312b53c035fa3d341d8fd90d7941fb1')).to.equal(false);
  });

  it("Should not allow to overwrite an anchor", async function () {
    const { gitAnchor } = await loadFixture(deployGitAnchorFixture);

    const hash = 'f5081c3cc312b53c035fa3d341d8fd90d7941fb1';

    await gitAnchor.setAnchor(hash);
    expect(await gitAnchor.isAnchored(hash)).to.equal(true);

    await expect(gitAnchor.setAnchor(hash)).to.be.revertedWith('Anchor already set');
  });

  it("Should emit an event on storing an anchor", async function () {
    const { gitAnchor, signer } = await loadFixture(deployGitAnchorFixture);

    const hash = 'f5081c3cc312b53c035fa3d341d8fd90d7941fb1';

    await expect(gitAnchor.setAnchor(hash))
      .to.emit(gitAnchor, "Anchored")
      .withArgs(hash, hash, time.latestBlock, signer.address);

  });

});
