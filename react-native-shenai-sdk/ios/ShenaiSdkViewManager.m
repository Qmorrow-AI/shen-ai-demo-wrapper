#import <React/RCTViewManager.h>
#import <ShenaiSDK/ShenaiView.h>

@interface ShenaiSdkViewManager : RCTViewManager
@end

@interface ShenaiContainerView : UIView
@property(strong, nonatomic) ShenaiView *shenaiViewController;
@end

@implementation ShenaiContainerView

- (instancetype)init {
  self = [super init];
  if (self) {
    _shenaiViewController = [[ShenaiView alloc] init];
    [self addSubview:_shenaiViewController.view];
  }
  return self;
}

- (void)layoutSubviews {
  [super layoutSubviews];
  self.shenaiViewController.view.frame = self.bounds;
}

@end

@implementation ShenaiSdkViewManager

RCT_EXPORT_MODULE(ShenaiSdkView)

- (UIView *)view {
  return [[ShenaiContainerView alloc] init];
}

@end
