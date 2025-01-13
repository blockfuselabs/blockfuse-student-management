import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlockFuseSMSModule = buildModule("BlockFuseSMSModule", (m) => {

    const save = m.contract("BlockFuseSMS");

    return { save };
});

export default BlockFuseSMSModule;
