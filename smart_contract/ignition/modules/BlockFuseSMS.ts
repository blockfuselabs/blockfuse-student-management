import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlockFuseSMSModule = buildModule("BlockFuseSMSModule", (m) => {
  const blockFuseSMS = m.contract("BlockFuseSMS");

  return { blockFuseSMS };
});

export default BlockFuseSMSModule;
