package ai.mxlabs.shenai_sdk_react_native;

import android.graphics.Color;
import android.view.View;

import androidx.annotation.NonNull;

import ai.mxlabs.shenai_sdk.ShenAIView;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

public class ShenaiSdkViewManager extends SimpleViewManager<ShenAIView> {
  public static final String REACT_CLASS = "ShenaiSdkView";

  @Override
  @NonNull
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  protected ShenAIView createViewInstance(@NonNull ThemedReactContext reactContext) {
      ShenAIView shenaiView = new ShenAIView(reactContext);
      // You can add lifecycle management here if required
      return shenaiView;
  }

  @Override
  public void onDropViewInstance(@NonNull ShenAIView view) {
      super.onDropViewInstance(view);
      // Handle any cleanup
      view.activityPaused(); // If required
  }
}
