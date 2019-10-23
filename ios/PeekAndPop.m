#import "PeekAndPop.h"
#import <React/RCTUIManagerObserverCoordinator.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerUtils.h>

@class RNPreviewViewController;

@interface RNPeekableWrapper : RCTView <RCTInvalidating>;

@property (nonatomic, copy) UIViewController *screenController;
@property (nonatomic, copy) RNPreviewViewController *previewController;
@property (nonatomic, copy) RCTDirectEventBlock onPop;
@property (nonatomic, copy) RCTDirectEventBlock onPeek;
@property (nonatomic, copy) RCTDirectEventBlock onAction;
@property (nonatomic, copy) RCTDirectEventBlock onDisappear;
@property (nonatomic, copy) NSArray *actionsForPreviewing;

- (instancetype)initWithUIManager:(RCTUIManager *)uiManager;
- (void)onPeekEvent;

@end

@interface RNPreviewViewController : UIViewController<UIViewControllerPreviewingDelegate>

- (instancetype)initWithWrapper:(RNPeekableWrapper *) wrapper;

@end

@implementation RNPreviewViewController {
  RNPeekableWrapper *_wrapper;
}


- (instancetype)initWithWrapper:(RNPeekableWrapper *) wrapper
{
  if (self = [super init]) {
    _wrapper = wrapper;
  }
  return self;
}

- (UIViewController *)previewingContext:(id<UIViewControllerPreviewing>)previewingContext viewControllerForLocation:(CGPoint)location
{
  [_wrapper onPeekEvent];
  return _wrapper.previewController;
}

- (void)previewingContext:(id<UIViewControllerPreviewing>)previewingContext
     commitViewController:(UIViewController *)viewControllerToCommit
{
  if (_wrapper.onPop) {
    _wrapper.onPop(nil);
  }
}

- (NSArray<id<UIPreviewActionItem>> *)previewActionItems {
  return _wrapper.actionsForPreviewing;
}

- (void)viewDidDisappear:(BOOL)animated {
  if (_wrapper.onDisappear) {
    _wrapper.onDisappear(nil);
  }
}

@end


@implementation RNPeekableWrapper {
  RCTUIManager *_uiManager;
  UIView *_child;
}


- (instancetype)initWithUIManager:(RCTUIManager *)uiManager
{
  if (self = [super initWithFrame:self.frame]) {
    _uiManager = uiManager;
    _previewController = [[RNPreviewViewController alloc] initWithWrapper:self];
  }
  
  return self;
}

- (void)setPreviewActions:(NSArray *)actions
{
  _actionsForPreviewing = [self translateToUIPreviewActionStyles: actions];
}

- (NSArray<UIPreviewAction *> *) translateToUIPreviewActionStyles:(NSArray *)actions
{
  NSMutableArray *result = [[NSMutableArray alloc] init];
  for (NSDictionary *action in actions) {
    if ([@"group" isEqualToString:action[@"type"]]) {
      NSArray<UIPreviewAction *> *innerActions = [self translateToUIPreviewActionStyles: action[@"actions"]];
      UIPreviewActionGroup *previewAction = [UIPreviewActionGroup actionGroupWithTitle:action[@"label"] style:UIPreviewActionStyleDefault actions:innerActions];
      [result addObject:previewAction];
    } else if ([@"destructive" isEqualToString:action[@"type"]]) {
      UIPreviewAction *previewAction = [UIPreviewAction actionWithTitle:action[@"label"] style:UIPreviewActionStyleDestructive handler:^(UIPreviewAction * _Nonnull _, UIViewController * _Nonnull previewViewController) {
        _onAction(@{@"key": action[@"_key"]});
      }];
      [result addObject:previewAction];
    } else {
      if (action[@"selected"] && [[action objectForKey:@"selected"] boolValue]) {
        UIPreviewAction *previewAction = [UIPreviewAction actionWithTitle:action[@"label"] style:UIPreviewActionStyleSelected handler:^(UIPreviewAction * _Nonnull _, UIViewController * _Nonnull previewViewController) {
          _onAction(@{@"key": action[@"_key"]});
        }];
        [result addObject:previewAction];
      } else {
        UIPreviewAction *previewAction = [UIPreviewAction actionWithTitle:action[@"label"] style:UIPreviewActionStyleDefault handler:^(UIPreviewAction * _Nonnull _, UIViewController * _Nonnull previewViewController) {
          _onAction(@{@"key": action[@"_key"]});
        }];
        [result addObject:previewAction];
      }
    }
  }
  return result;
}

- (void)setChildRef:(NSInteger)reactTag
{
  _child = [_uiManager viewForReactTag:[NSNumber numberWithInteger: reactTag]];
  _previewController.view = super.reactSubviews[0];
}

-(void)onPeekEvent {
  if (self.onPeek) {
    _previewController.preferredContentSize = _previewController.view.bounds.size;
    self.onPeek(nil);
  }
}

- (void)layoutSubviews {
  [super layoutSubviews];
  // Called after attaching
  BOOL isRNScreen = NO;
  UIView *superScreen = self;
  while (![superScreen isKindOfClass:RCTRootView.class] && !isRNScreen) {
    superScreen  = [superScreen reactSuperview];
    NSString *name = NSStringFromClass ([superScreen class]);
    // React-native-screens changes react hierarchy and searching
    // for root view is not positive. It does not follow any
    // good programming rules but I wished not to add RNS as
    // a dependency and make it workable and without this lib
    isRNScreen = ([name isEqualToString:@"RNScreenView"]);
  }
  
  if (isRNScreen) {
    _screenController = (UIViewController *)[superScreen valueForKey: @"controller"];
    
  } else {
    _screenController = ((RCTRootView*) superScreen).reactViewController;
  }
  [_screenController registerForPreviewingWithDelegate:_previewController sourceView:_child];
  
}


- (void)invalidate
{
  // TODO: maybe not needed. Maybe memory leak?
  // [_screenController unregisterForPreviewingWithContext:_previewController];
  _previewController.view = nil;
  _previewController = nil;
}

@end


@implementation PeekAndPop


RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(active, BOOL)
RCT_EXPORT_VIEW_PROPERTY(childRef, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(previewActions, NSArray)
RCT_EXPORT_VIEW_PROPERTY(onPop, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPeek, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onAction, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onDisappear, RCTDirectEventBlock);

- (UIView *)view
{
  return [[RNPeekableWrapper alloc] initWithUIManager:self.bridge.uiManager];
}



@end

