'use client';

import Image, { ImageProps } from 'next/image';

const CRYPTOCURRENCY_ICON_PATHS = {
    abstract: '/chains/abstract.webp',
    algorand: '/chains/algorand.webp',
    apechain: '/chains/apechain.webp',
    aptos: '/chains/aptos.svg',
    arbitrum: '/chains/arbitrum.svg',
    arbitrumnova: '/chains/arbitrumnova.webp',
    astar: '/chains/astar.webp',
    aurora: '/chains/aurora.svg',
    avalanche: '/chains/avalanche.svg',
    avalanchedfk: '/chains/avalanchedfk.webp',
    balancer: '/cryptocurrency/balancer.svg',
    base: '/chains/base.svg',
    beam: '/chains/beam.webp',
    berachain: '/chains/berachain.webp',
    blast: '/chains/blast.webp',
    boba: '/chains/boba.webp',
    bouncebit: '/chains/bouncebit.webp',
    bsc: '/chains/bsc.svg',
    binance: '/chains/bsc.svg',
    cardano: '/chains/cardano.webp',
    celo: '/chains/celo.svg',
    conflux: '/chains/conflux.svg',
    cronos: '/chains/cronos.svg',
    dogechain: '/chains/dogechain.webp',
    elastos: '/chains/elastos.svg',
    energi: '/chains/energi.webp',
    ethereum: '/chains/ethereum.svg',
    ethereumclassic: '/chains/ethereumclassic.webp',
    ethereumpow: '/chains/ethereumpow.webp',
    fantom: '/chains/fantom.svg',
    flare: '/chains/flare.webp',
    flowevm: '/chains/flowevm.svg',
    fraxtal: '/chains/fraxtal.webp',
    fuse: '/chains/fuse.webp',
    harmony: '/chains/harmony.svg',
    hedera: '/chains/hedera.webp',
    hyperevm: '/chains/hyperevm.svg',
    hyperliquid: '/chains/hyperliquid.svg',
    icp: '/chains/icp.webp',
    injective: '/chains/injective.webp',
    ink: '/chains/ink.svg',
    iotex: '/chains/iotex.svg',
    katana: '/chains/katana.webp',
    kava: '/chains/kava.svg',
    kcc: '/chains/kcc.svg',
    linea: '/chains/linea.svg',
    manta: '/chains/manta.webp',
    mantle: '/chains/mantle.svg',
    merlinchain: '/chains/merlinchain.webp',
    meter: '/chains/meter.svg',
    metis: '/chains/metis.webp',
    mode: '/chains/mode.webp',
    moonbeam: '/chains/moonbeam.webp',
    moonit: '/chains/moonit.webp',
    moonriver: '/chains/moonriver.svg',
    movement: '/chains/movement.webp',
    multiversx: '/chains/multiversx.webp',
    near: '/chains/near.svg',
    neonevm: '/chains/neonevm.webp',
    oasisemerald: '/chains/oasisemerald.webp',
    oasissapphire: '/chains/oasissapphire.webp',
    opbnb: '/chains/opbnb.svg',
    optimism: '/chains/optimism.svg',
    osmosis: '/chains/osmosis.svg',
    plasma: '/chains/plasma.webp',
    polkadot: '/chains/polkadot.webp',
    polygon: '/chains/polygon.svg',
    polygonzkevm: '/chains/polygonzkevm.svg',
    pulsechain: '/chains/pulsechain.webp',
    pumpswap: '/cryptocurrency/pumpswap.webp',
    scroll: '/chains/scroll.webp',
    seiv2: '/chains/seiv2.webp',
    solana: '/chains/solana.svg',
    soneium: '/chains/soneium.webp',
    sonic: '/chains/sonic.webp',
    stacks: '/chains/stacks.webp',
    starknet: '/chains/starknet.webp',
    stepnetwork: '/chains/stepnetwork.webp',
    story: '/chains/story.webp',
    sui: '/chains/sui.svg',
    sushiswap: '/cryptocurrency/sushiswap.svg',
    taiko: '/chains/taiko.webp',
    telos: '/chains/telos.webp',
    ton: '/chains/ton.webp',
    tron: '/chains/tron.webp',
    unichain: '/chains/unichain.webp',
    vana: '/chains/vana.webp',
    velas: '/chains/velas.svg',
    venom: '/chains/venom.webp',
    worldchain: '/chains/worldchain.webp',
    xrpl: '/chains/xrpl.webp',
    zircuit: '/chains/zircuit.webp',
    zkfair: '/chains/zkfair.webp',
    zksync: '/chains/zksync.svg',
    zora: '/chains/zora.webp',
} as const;

export type CryptocurrencyIconName = keyof typeof CRYPTOCURRENCY_ICON_PATHS;

type BaseImageProps = Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>;

interface CryptocurrencyIconProps extends BaseImageProps {
    name: CryptocurrencyIconName;
    alt?: string;
    size?: number;
    width?: number;
    height?: number;
}

const formatAltText = (name: string) =>
    name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

export default function CryptocurrencyIcon({
    name,
    alt,
    size,
    width,
    height,
    ...rest
}: CryptocurrencyIconProps) {
    const resolvedWidth = width ?? size ?? 32;
    const resolvedHeight = height ?? size ?? 32;

    return (
        <Image
            src={CRYPTOCURRENCY_ICON_PATHS[name]}
            alt={alt ?? `${formatAltText(name)} icon`}
            width={resolvedWidth}
            height={resolvedHeight}
            {...rest}
        />
    );
}
