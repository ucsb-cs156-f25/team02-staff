package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UCSBDiningCommonsMenuItemsController.class)
@Import(TestConfig.class)
public class UCSBDiningCommonsMenuItemControllerTests extends ControllerTestCase {

  @MockBean UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  @MockBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitems/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitems/all"))
        .andExpect(status().is(200)); // logged
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/ucsbdiningcommonsmenuitems/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/ucsbdiningcommonsmenuitems/post"))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_ucsbdiningcommonsmenuitems() throws Exception {

    // arrange
    UCSBDiningCommonsMenuItem menuitem1 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("Chicken Noodle Soup")
            .station("salad bar")
            .build();

    UCSBDiningCommonsMenuItem menuitem2 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("portola")
            .name("Cheeseburger")
            .station("entrees")
            .build();

    ArrayList<UCSBDiningCommonsMenuItem> expectedMenuItems = new ArrayList<>();
    expectedMenuItems.addAll(Arrays.asList(menuitem1, menuitem2));

    when(ucsbDiningCommonsMenuItemRepository.findAll()).thenReturn(expectedMenuItems);

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/ucsbdiningcommonsmenuitems/all"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedMenuItems);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_diningcommonsmenuitem() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem menuitem1 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("ChickenNoodleSoup")
            .station("saladBar")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.save(eq(menuitem1))).thenReturn(menuitem1);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/ucsbdiningcommonsmenuitems/post?diningCommonsCode=carrillo&name=ChickenNoodleSoup&station=saladBar")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(menuitem1);
    String expectedJson = mapper.writeValueAsString(menuitem1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitems?id=7"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {

    // arrange

    UCSBDiningCommonsMenuItem menuitem =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("ChickenNoodleSoup")
            .station("saladBar")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(123L))).thenReturn(Optional.of(menuitem));

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/ucsbdiningcommonsmenuitems?id=123"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(eq(123L));
    String expectedJson = mapper.writeValueAsString(menuitem);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {

    // arrange

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/ucsbdiningcommonsmenuitems?id=7"))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(eq(7L));
    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_men_item() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem menuItem1 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("ChickenNoodleSoup")
            .station("saladBar")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(123L))).thenReturn(Optional.of(menuItem1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsbdiningcommonsmenuitems?id=123").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(123L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 123 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_commons_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(12L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsbdiningcommonsmenuitems?id=12").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(12L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 12 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_menu_item() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem menuItemOrig =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("ChickenNoodleSoup")
            .station("saladBar")
            .build();

    UCSBDiningCommonsMenuItem menuItemEdited =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("portola")
            .name("Cheeseburger")
            .station("entrees")
            .build();

    String requestBody = mapper.writeValueAsString(menuItemEdited);

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(7L)))
        .thenReturn(Optional.of(menuItemOrig));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsbdiningcommonsmenuitems?id=7")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1))
        .save(menuItemEdited); // should be saved with updated info
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_menu_item_that_does_not_exist() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem editedMenuItem =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("ChickenNoodleSoup")
            .station("saladBar")
            .build();

    String requestBody = mapper.writeValueAsString(editedMenuItem);
    when(ucsbDiningCommonsMenuItemRepository.findById(eq(7L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsbdiningcommonsmenuitems?id=7")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 7 not found", json.get("message"));
  }
}
