import { Card, Skeleton } from 'antd'

const SkeletonCard = () => {
    return (
        <Card
            cover={
                <Skeleton.Image active className="!w-full" />
            }
        >
        </Card>
    )
}

export default SkeletonCard