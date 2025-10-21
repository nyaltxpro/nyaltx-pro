'use client';

import Image, { ImageProps } from 'next/image';

const CRYPTOCURRENCY_ICON_PATHS = {
    abstract: '/cryptocurrency/abstract.svg',
    arbitrum: '/cryptocurrency/arbitrum.svg',
    avalanche: '/cryptocurrency/avalanche.svg',
    balancer: '/cryptocurrency/balancer.svg',
    base: '/cryptocurrency/base.svg',
    bsc: '/cryptocurrency/bsc.svg',
    cronos: '/cryptocurrency/cronos.svg',
    ethereum: '/cryptocurrency/ethereum.svg',
    hyperevm: '/cryptocurrency/hyperevm.svg',
    linea: '/cryptocurrency/linea.svg',
    near: '/cryptocurrency/near.svg',
    optimism: '/cryptocurrency/optimism.svg',
    polygon: '/cryptocurrency/polygon.svg',
    pumpswap: '/cryptocurrency/pumpswap.webp',
    solana: '/cryptocurrency/solana.svg',
    sonic: '/cryptocurrency/sonic.svg',
    starknet: '/cryptocurrency/starknet.svg',
    sui: '/cryptocurrency/sui.svg',
    sushiswap: '/cryptocurrency/sushiswap.svg',
    unichain: '/cryptocurrency/unichain.svg',
    zksync: '/cryptocurrency/zksync.svg',
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
