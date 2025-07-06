import React, { useState, useEffect } from 'react';

interface FlyToCartProps {
  isActive: boolean;
  productImage: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onAnimationEnd: () => void;
}

const FlyToCart: React.FC<FlyToCartProps> = ({
  isActive,
  productImage,
  startPosition,
  endPosition,
  onAnimationEnd
}) => {
  const [position, setPosition] = useState(startPosition);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    console.log('飞入动画起点:', startPosition);
    console.log('飞入动画终点:', endPosition);
    
    // 从产品位置飞向购物车位置的动画
    const animationDuration = 800; // 增加到800ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      
      // 使用贝塞尔曲线让动画更自然
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      // 计算当前位置
      const newX = startPosition.x + (endPosition.x - startPosition.x) * easeOutQuart;
      const newY = startPosition.y + (endPosition.y - startPosition.y) * easeOutQuart;
      
      // 添加更明显的弧度，让动画更加生动
      const arc = Math.sin(progress * Math.PI) * Math.min(150, Math.abs(startPosition.x - endPosition.x) * 0.3);
      
      // 添加轻微的旋转效果
      const newRotation = Math.sin(progress * Math.PI * 2) * 15;
      setRotation(newRotation);
      
      setPosition({
        x: newX,
        y: newY - arc // 减去arc，因为Y轴是向下增长的
      });
      
      // 缩小尺寸并增加弹性效果
      const bounce = progress > 0.8 ? Math.sin((progress - 0.8) * 5 * Math.PI) * 0.1 : 0;
      setScale(1 - easeOutQuart * 0.5 + bounce);
      
      // 结束时渐隐
      if (progress > 0.7) {
        setOpacity(1 - (progress - 0.7) * 3.3); // 0.7到1的范围内降低透明度
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画完成
        setTimeout(() => {
          onAnimationEnd();
        }, 100);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isActive, startPosition, endPosition, onAnimationEnd]);
  
  if (!isActive) return null;
  
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity: opacity,
        transition: 'none'
      }}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
        <img 
          src={productImage} 
          alt="添加到购物车" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default FlyToCart; 